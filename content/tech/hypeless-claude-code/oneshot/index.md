---
title: "Oneshot a whole API"
date: 2026-01-25
image: images/tech/hypeless-claude-code/oneshot.jpg
series: "Hypeless Claude Code"
weight: 3
draft: true
description: >
    Use the hypeless plugin to generate a blog API with auth, posts, and a frontend in one prompt. Then test it with curl.
tags:
    - AI
---

We built a plugin in the last post. Let's see what it can do.

One prompt. Auth, blog posts, and a frontend to render them. We'll generate the whole thing, then hit it with curl to prove it works.


# The Prompt

The trick to a good oneshot is being specific about structure without micromanaging implementation. You want to describe _what_ you need, not _how_ to build it. The plugin already knows the how.

```
Use the hypeless plugin to:

- Create a new project called blogapi
- User model: username, email, password (hashed), bio
- Post model: title, slug, body, published (boolean), author relation
- Auth endpoints: register, login (JWT), get current user
- Post endpoints: CRUD, plus GET /posts for public listing (published only)
- Add auth middleware that protects create/update/delete post routes
- Add a simple frontend route at GET / that renders published posts as HTML
- Use SQLite
```

That's it. Paste that in and let Claude work.

A few things to notice about how this prompt is written.

**Models before routes.** The data shapes everything else. If Claude knows the models first, it makes better decisions about what the endpoints accept and return.

**Explicit relations.** "author relation" tells Claude that posts belong to users. Without it, you might get a flat `authorName` string field instead of a proper foreign key.

**Behavior, not implementation.** "published only" tells Claude what the listing should do without dictating how. It'll figure out the `where: { published: true }` on its own.

**The frontend is one line.** That's intentional. We want something minimal that proves the data flows end to end. Claude will generate a simple HTML template. It won't be pretty, but it'll work.


# What Got Generated

I used the prompt above to generate an API, called hypeless API. I'm going to reference that project for the rest of the post, but you should also be prepared to get a different system each time you run the prompt. The magic is getting them to solve the problem reliably, even if it creates a new path each time.

On Github: [https://github.com/jmsdnns/hypeless_api](https://github.com/jmsdnns/hypeless_api)

Claude took the prompt and ran the plugin's skills internally. It did `/init-rest`, `/model`, `/route`, and `/middleware`, with the specialist agents handling their respective domains.

Here's the project structure it finished with:

```
blogapi/
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── types/
    │   └── index.ts
    ├── middleware/
    │   ├── auth.ts
    │   └── errorHandler.ts
    ├── controllers/
    │   ├── auth.ts
    │   ├── health.ts
    │   └── posts.ts
    └── routes/
        ├── index.ts
        ├── auth.ts
        ├── health.ts
        ├── posts.ts
        └── frontend.ts
```

For a project this size, the business logic lives directly in the controllers. If the project grows, you can extract a services layer later.

Let's walk through the interesting parts.

## The Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  bio       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  slug      String   @unique
  body      String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
}
```

Autoincrementing integers for IDs, which is the right default for SQLite. Unique constraints on username, email, and slug. The relation between posts and users is set up properly with a foreign key. Published defaults to false, so posts are drafts until you explicitly publish them.

## Auth

The auth controller handles registration, login, and a "get me" endpoint. Here's register.

```typescript
export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, bio } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'username, email, and password are required' });
    return;
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existing) {
    res.status(409).json({ error: 'Username or email already taken' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, password: hashed, bio },
    select: { id: true, username: true, email: true, bio: true, createdAt: true },
  });

  res.status(201).json({ data: user, message: 'User registered' });
};
```

A few things worth noting. It checks for duplicate username _or_ email before creating, returning a 409 conflict if either exists. The `select` on `create` ensures the password hash never leaves the server. Bcrypt with cost factor 10 for hashing.

Login returns a JWT with the user ID and username baked into the payload.

```typescript
const token = jwt.sign(
  { userId: user.id, username: user.username },
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

Seven day expiry. The token payload is typed with an `AuthPayload` interface so the rest of the app knows what's in it.

## Auth Middleware

```typescript
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

Applied selectively in the routes. Public endpoints like listing posts and viewing a single post don't require auth. Creating, updating, and deleting posts does.

```typescript
router.get('/', listPublished);
router.get('/:slug', getPost);
router.post('/', requireAuth, createPost);
router.put('/:slug', requireAuth, updatePost);
router.delete('/:slug', requireAuth, deletePost);
```

The Express `Request` type is augmented globally so `req.user` is available everywhere after auth.

```typescript
export interface AuthPayload {
  userId: number;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
```

## Posts

The posts controller is the meatiest file. The `slugify` function derives URL-safe slugs from titles automatically.

```typescript
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

Creating a post doesn't accept a slug from the user. It generates one from the title and checks for collisions.

```typescript
const slug = slugify(title);
const existing = await prisma.post.findUnique({ where: { slug } });
if (existing) {
  res.status(409).json({ error: 'A post with a similar title already exists' });
  return;
}
```

Update and delete both check ownership. You can only modify your own posts.

```typescript
if (post.authorId !== req.user!.userId) {
  res.status(403).json({ error: 'You can only edit your own posts' });
  return;
}
```

## The Frontend

The frontend is a route that queries published posts and returns HTML. It lives in `routes/frontend.ts` rather than a separate views directory, which makes sense — it's a route that happens to return HTML instead of JSON.

```typescript
router.get('/', async (_req: Request, res: Response) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const postCards = posts
    .map(
      (p) => `
      <article>
        <h2><a href="/posts/${p.slug}">${p.title}</a></h2>
        <p class="meta">by ${p.author.username} &middot; ${p.createdAt.toLocaleDateString()}</p>
        <p>${p.body.slice(0, 200)}${p.body.length > 200 ? '...' : ''}</p>
      </article>`
    )
    .join('\n');

  res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; color: #333; }
    h1 { margin-bottom: 2rem; border-bottom: 2px solid #333; padding-bottom: 0.5rem; }
    article { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #ddd; }
    article h2 { margin-bottom: 0.25rem; }
    article h2 a { color: #1a1a2e; text-decoration: none; }
    article h2 a:hover { text-decoration: underline; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 0.75rem; }
    .empty { color: #999; font-style: italic; }
  </style>
</head>
<body>
  <h1>Blog</h1>
  ${posts.length > 0 ? postCards : '<p class="empty">No posts yet.</p>'}
</body>
</html>`);
});
```

It truncates post bodies to 200 characters with an ellipsis for the listing. Each title links to `/posts/:slug`. It uses Georgia serif, which gives it a bookish feel. Not going to win design awards, but it works.

## The Server

The entry point is minimal. Express 5, cors, helmet, JSON parsing, routes, error handler.

```typescript
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(routes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

Routes are aggregated in `routes/index.ts`, which mounts each router at its prefix.

```typescript
router.use('/', frontendRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
```


# Running It

Install dependencies and set up the database.

```shell
$ cd blogapi
$ npm install
$ npx prisma migrate dev --name init
```

Start the server.

```shell
$ npm run dev
```


# Verify API with CURL

## Create an account

```shell
$ curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "jmsdnns", "email": "ih@ve.one", "password": "meowmeow"}' | jq
```

```json
{
  "data": {
    "id": 1,
    "username": "jmsdnns",
    "email": "ih@ve.one",
    "bio": null,
    "createdAt": "2026-01-25T..."
  },
  "message": "User registered"
}
```

## Log in

```shell
$ curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ih@ve.one", "password": "meowmeow"}' | jq
```

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 1,
      "username": "jmsdnns",
      "email": "ih@ve.one"
    }
  }
}
```

Grab that token. We'll need it.

```shell
$ TOKEN="eyJhbGciOiJIUzI1NiIsIn..."
```

## Write a post

```shell
$ curl -s -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "First Post",
    "body": "This whole API was generated in one prompt.",
    "published": true
  }' | jq
```

```json
{
  "data": {
    "id": 1,
    "title": "First Post",
    "slug": "first-post",
    "body": "This whole API was generated in one prompt.",
    "published": true,
    "createdAt": "2026-02-14T21:14:22.054Z",
    "updatedAt": "2026-02-14T21:14:22.054Z",
    "authorId": 1,
    "author": {
      "id": 1,
      "username": "jmsdnns"
    }
  }
}
```

Notice we didn't pass a slug. The API derived "first-post" from the title automatically.

## See it rendered

Open `http://localhost:3000` in a browser. There's your post, rendered as HTML. Author name, date, body. The data went from curl to the database to the browser.

![Rendered](RenderedPost.jpg)

Or verify with curl.

```shell
$ curl -s http://localhost:3000
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog</title>
  ...
</head>
<body>
  <h1>Blog</h1>
  <article>
    <h2><a href="/posts/first-post">First Post</a></h2>
    <p class="meta">by jmsdnns &middot; 2/14/2026</p>
    <p>This whole API was generated in one prompt.</p>
  </article>
</body>
</html>
```

All it took was one prompt to get a working API with auth, blog posts, and a frontend.


# Prompt Crafting Tips

A few patterns that make oneshot prompts work better.

**Name your project.** "Create a new project called blogapi" gives Claude a directory name and a mental anchor. Without it, you get asked for a name or it picks something generic.

**List models before routes.** Data shapes behavior. If Claude processes the models first, the routes that follow will reference the right fields and relations.

**State behavior, not code.** "published only" is better than "add a where clause filtering by published equals true." You want Claude making implementation decisions, not transcribing yours. The generated code used `where: { published: true }` in both the API listing and the frontend route without being told how.

**Include one weird thing.** The frontend route is unusual for an API project. It forces Claude to think beyond the standard CRUD template. This is where you find out if the generation actually understands your intent or is just pattern matching. It put the frontend in `routes/frontend.ts`, handled the HTML response type correctly, even truncated long post bodies in the listing.

**Keep it under 15 lines.** Oneshot prompts that get too long start tripping over themselves. If you need more than 15 lines, you probably need a plan and a task list instead. That's what the [structuring work]({{< ref "work" >}}) post covers.
