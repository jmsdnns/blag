---
title: "Make a plugin to build APIs"
date: 2026-01-27
image: images/tech/hypeless-claude-code/plugin.jpg
series: "Hypeless Claude Code"
weight: 2
draft: true
description: >
    Build a Claude Code plugin from scratch for scaffolding REST APIs with Express, TypeScript, and Prisma. Covers agents, skills, hooks, and how they all fit together.
tags:
    - AI
---

We're going to build a plugin from scratch. By the end, you'll have a tool that scaffolds REST APIs with Express, TypeScript, and Prisma, complete with specialist agents that know the stack, skills that generate boilerplate, and a hook that catches type errors after every edit.

The plugin is called [hypeless](https://github.com/jmsdnns/hypeless). You can install the finished version if you just want to use it, but this post walks through building it piece by piece so you understand how plugins work.


# Create the plugin

Prepare plugins directory:

```shell
mkdir -p ~/.claude/plugins
cd ~/.claude/plugins  # the rest of the post assumes you're here
```
A plugin starts as a directory with a manifest. That's the minimum.

```
mkdir -p hypeless/plugin/.claude-plugin
```

Create the manifest at `hypeless/plugin/.claude-plugin/plugin.json`.

```json
{
  "name": "hypeless",
  "description": "A simple plugin for building REST APIs with Express + TypeScript + Prisma",
  "author": {
    "name": "your-name"
  }
}
```

That's a working plugin! It doesn't do anything yet, but Claude Code will recognize it. Install it by cloning or symlinking it into your project's `.claude/plugins/` directory and restarting Claude. Run `/plugins` to verify it shows up.


# A first agent

Agents are markdown files that give Claude specialized knowledge. We'll start with `typescript-pro` — an agent that knows TypeScript deeply.

Create a TypeScript pro by adding this file: `hypeless/plugin/agents/typescript-pro.md`.

```markdown
---
name: typescript-pro
description: Expert in TypeScript type system, strict mode patterns, and full-stack type safety
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

You are a senior TypeScript developer with mastery of TypeScript 5.0+
and its ecosystem.

## Core Standards

- Strict mode enabled with all compiler flags
- No `any` without justification. Uses `unknown` and narrow with type guards
- 100% type coverage for public APIs
- Source maps and declaration files properly configured
```

The frontmatter declares the agent's name, a description Claude uses to decide when to spawn it, and which tools it can access. The body is a system prompt. It's loaded into the agent's context window when it starts.

That description line matters. When Claude is deciding whether to spin up an agent, it reads descriptions to find the best fit. "Expert in TypeScript type system, strict mode patterns, and full-stack type safety" tells Claude exactly when this agent is relevant.

The real `typescript-pro` agent is much longer. It includes sections on advanced type patterns, full-stack type safety, build optimization, error handling, and framework-specific typing for Express. The more context you give an agent, the better its output. Think of it as writing documentation that the agent will reference while it works.


# Agents, agents, agents

The pattern is the same for each. Create a markdown file, declare what it knows, write a system prompt that teaches it.

Create an Express pro that knows Express 5.x patterns, middleware composition, routing, error handling, security, and request validation by adding the following markdown to this file: `hypeless/plugin/agents/express-pro.md`

```markdown
---
name: express-pro
description: Expert in Express.js patterns, middleware, routing, and API development
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

You are a senior Express.js developer specializing in building REST APIs
with Node.js.

## Core Standards

- Express 5.x patterns (native async error handling)
- Async/await in all route handlers with proper error handling
- Middleware composition for cross-cutting concerns
- Sub-100ms p95 response time target
- Structured JSON error responses
```

Create a Prisma pro that knows schema design, query optimization, indexing strategy, migrations, and common patterns like soft deletes and cursor-based pagination by adding the following markdown to this file: `hypeless/plugin/agents/prisma-pro.md`

```markdown
---
name: prisma-pro
description: Expert in Prisma ORM, schema design, migrations, and query optimization
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

You are a senior database engineer specializing in Prisma ORM and
relational data modeling.

## Core Standards

- Query time < 100ms for typical operations
- Select only fields you need. Never `findMany()` without `select`
- Index fields used in `where` and `orderBy`
- Use transactions for operations that must succeed together
```

Each of these has a much longer body in the real plugin with detailed code examples, pattern libraries, and review checklists. The snippets above are the skeletons. Fill them out based on what you want the agent to know.


# An agent for agents

Three specialists need a coordinator. The `stack-orchestrator` agent decides which specialist handles each request.

Create `hypeless/plugin/agents/stack-orchestrator.md`.

```markdown
---
name: stack-orchestrator
description: Coordinates specialists for Express + TypeScript + Prisma work
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

You coordinate work across the Express + TypeScript + Prisma stack.

## Routing Decisions

When a request comes in, determine which specialist handles it:

| Domain | Route to | Examples |
|--------|----------|----------|
| Routing, middleware, request handling | `express-pro` | "Add rate limiting" |
| Type system, generics, strict mode | `typescript-pro` | "Fix type errors" |
| Database schema, queries, migrations | `prisma-pro` | "Add a relation" |

## Multi-Domain Tasks

If a task spans multiple areas, break it into parts:

**Example:** "Add a comments feature"
1. `prisma-pro` → Design Comment model and relations
2. `express-pro` → Design routes and middleware
3. `typescript-pro` → Ensure types flow correctly

Synthesize their outputs into a coherent response.
```

Notice it has the `Task` tool in its list. That's what lets it spawn sub-agents. Without it, the orchestrator can't delegate, it can only answer directly.

There's also a `task-distributor` agent that breaks complex features into ordered task lists with dependency markers and specialist assignments. It's useful for larger work like "add user authentication" where the order of operations matters.

```markdown
---
name: task-distributor
description: Breaks complex work into tasks and routes them appropriately
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

You break down complex development work into actionable tasks.

## Task Decomposition

When given a feature or complex task:

1. **Identify components** - What pieces make up this work?
2. **Determine dependencies** - What must happen first?
3. **Assign to specialists** - Who handles each piece?
4. **Define "done"** - What does completion look like?
```

Five agents total. Three specialists, one coordinator, one planner. Each is a markdown file.


# Add the first skill

Skills are slash commands. They're also markdown files, but they live in a `skills/` directory and each gets its own subdirectory with a `SKILL.md` file.

The most impactful skill to build first is `/init-rest`. It scaffolds a complete project skeleton. Without it, you're explaining the project structure every time you start something new.

Create `hypeless/plugin/skills/init-rest/SKILL.md`.

```markdown
---
name: init-rest
description: Initialize Express + TypeScript + Prisma REST API project
---

Create a new Express REST API with TypeScript and Prisma.
Ask the user for a project name first.

## Directory Structure

{project-name}/
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma
└── src/
    ├── index.ts           # Express server setup
    ├── routes/
    │   └── index.ts       # Route aggregator
    ├── controllers/
    │   └── health.ts      # Health check controller
    ├── middleware/
    │   └── errorHandler.ts
    └── types/
        └── index.ts       # Shared types

## Dependencies

**Production:**
- express
- cors
- helmet

**Dev:**
- typescript
- ts-node-dev
- @types/express
- @types/cors
- @types/node
- prisma
```

The skill continues with templates for the other key files too: `package.json` scripts, the Express server setup, route aggregation pattern, health check controller, error handler middleware, and the Prisma schema with SQLite as default.

When someone types `/init-rest`, this entire document gets loaded into context. Claude reads it and generates the project accordingly using the instructions we provided in the skill definition.


# Add scaffolding skills

The same pattern applies for the remaining skills. Each one teaches Claude how to scaffold a specific piece of the stack.

## /model

Create `hypeless/plugin/skills/model/SKILL.md`. This skill adds Prisma models to the schema.

```markdown
---
name: model
description: Add a Prisma model and generate types
---

Add a new model to the Prisma schema and generate TypeScript types.

## Gather Information

Ask the user for:
1. Model name (PascalCase, e.g., `User`, `BlogPost`)
2. Fields with their types

## Template

Add to `prisma/schema.prisma`:

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}
```

It includes a field type reference table, relation examples (one-to-many, many-to-many), and conventions like always including `id`, `createdAt`, `updatedAt`. After adding the model, it prompts the user about creating routes and a controller too.

## /route

Create `hypeless/plugin/skills/route/SKILL.md`. This skill scaffolds REST endpoints with a controller.

```markdown
---
name: route
description: Scaffold a new REST API route with controller
---

Create a new REST API route with its controller.

## Gather Information

Ask the user for:
1. Resource name (singular, e.g., `user`, `post`, `comment`)
2. Which endpoints to include:
   - GET /resources (list)
   - GET /resources/:id (get one)
   - POST /resources (create)
   - PUT /resources/:id (update)
   - DELETE /resources/:id (delete)
```

It includes full templates for both the route file and controller file, with async handlers, proper error passing to `next()`, and correct HTTP status codes. The last step is wiring the new route into `src/routes/index.ts`.

## /middleware

Create `hypeless/plugin/skills/middleware/SKILL.md`. This skill generates middleware for auth, validation, rate limiting, logging, or custom.

```markdown
---
name: middleware
description: Scaffold Express middleware (auth, validation, logging, etc.)
---

Create a new Express middleware.

## Gather Information

Ask the user for:
1. Middleware type:
   - **auth** - JWT/session authentication
   - **validate** - Request body validation
   - **rateLimit** - Rate limiting
   - **logging** - Request logging
   - **custom** - Custom middleware
```

Each type has a complete template. The auth middleware extends the Request type to include user info. The validation middleware uses Zod schemas. The rate limiter tracks requests by IP. The logger uses `res.on('finish')` to capture response time.

## /service

Create `hypeless/plugin/skills/service/SKILL.md`. This skill extracts business logic out of controllers and into a service layer.

```markdown
---
name: service
description: Scaffold a service layer for business logic
---

Create a service to encapsulate business logic separate from controllers.

## Gather Information

Ask the user for:
1. Service name (e.g., `user`, `auth`, `email`)
2. Key operations it should handle
```

It includes a service template with `findAll`, `findById`, `create`, `update`, and `delete` methods, plus custom error classes (`NotFoundError`, `ValidationError`, `UnauthorizedError`) and an updated error handler that knows how to use them.

This is the skill that teaches the separation between controllers (HTTP concerns) and services (business logic). Controllers become thin; they call the service and send the response.


# Add the hook

Hooks are different from agents and skills. They're configured in JSON, not written in markdown, and they fire automatically instead of being invoked.

Create `hypeless/plugin/hooks.json`.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "[ -f tsconfig.json ] && npx tsc --noEmit 2>&1 | head -20 || true"
      }
    ]
  }
}
```

This fires after every `Edit` or `Write` tool call. It checks if there's a `tsconfig.json` in the project (so it only runs in TypeScript projects), then runs the compiler in check mode. If there are type errors, Claude sees them immediately and can fix them before moving on.

The `| head -20` keeps the output short. You don't want 200 lines of compiler errors flooding the context. The `|| true` prevents the hook from blocking Claude if the check fails.

One hook, and every edit gets type-checked automatically.


# Add the review skill

This one ties everything together. The `/review` skill coordinates all three specialist agents to review code from different angles.

Create `hypeless/plugin/skills/review/SKILL.md`.

```markdown
---
name: review
description: Code review using specialist agents
---

Coordinate a code review across all specialist agents.

## Gather Information

Ask the user:
1. **What to review?**
   - "entire codebase"
   - specific directory (e.g., `src/routes`)
   - specific file (e.g., `src/controllers/user.ts`)
   - recent changes (git diff)

## Review Process

Use the `stack-orchestrator` to coordinate reviews from each specialist:

### 1. Express Review (`express-pro`)
Check for: middleware ordering, async error handling, response format
consistency, security gaps, route organization, input validation

### 2. TypeScript Review (`typescript-pro`)
Check for: `any` usage, missing return types, loose generics,
type safety between layers, Prisma type usage

### 3. Prisma Review (`prisma-pro`)
Check for: N+1 patterns, missing indexes, inefficient queries,
transaction gaps, schema issues
```

It also defines an output format with priority levels (HIGH, MED, LOW), specific file and line references, and a summary with the top recommendation. The guideline at the end says "if the code is solid, say so. Don't invent issues." That's important. Without it, review tools tend to nitpick.


# The finished plugin

Here's what we built.

```
hypeless/plugin/
├── .claude-plugin/
│   └── plugin.json
├── hooks.json
├── agents/
│   ├── express-pro.md
│   ├── typescript-pro.md
│   ├── prisma-pro.md
│   ├── stack-orchestrator.md
│   └── task-distributor.md
└── skills/
    ├── init-rest/
    │   └── SKILL.md
    ├── model/
    │   └── SKILL.md
    ├── route/
    │   └── SKILL.md
    ├── middleware/
    │   └── SKILL.md
    ├── service/
    │   └── SKILL.md
    └── review/
        └── SKILL.md
```

Five agents, six skills, one hook. Everything is markdown and JSON. No code to compile, no dependencies to install.

The agents give Claude deep knowledge of Express, TypeScript, and Prisma. The skills turn repetitive scaffolding into one-word commands. The hook catches type errors automatically. And the review skill ties all three specialists together for code review.

Install it by cloning it into `.claude/plugins/` in your project.

```shell
$ git clone https://github.com/jmsdnns/hypeless .claude/plugins/hypeless
```

Restart Claude and run `/plugins` to verify it loaded. Then try `/init-rest` to scaffold your first project.
