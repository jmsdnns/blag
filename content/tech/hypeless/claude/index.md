---
title: "Claude"
date: 2026-01-25
image: images/tech/hypeless/claude.jpg
series: "Hypeless AI"
weight: 2
draft: true
description: >
    I'm going to quickly layout the gist of how I use Claude for coding. This is for anyone who is recently curious.
tags:
    - AI
---

I'm going to quickly layout the gist of how I use Claude for coding. This is for anyone who is recently curious.

I have been having an excellent experience pulling off things with code that I wouldn't usually have the time for. For me, that is the key thing that makes AI tools worth using. It isn't just about doing the same work faster, it's also about having extra time to do things you don't usually have time for. I can get things done that would otherwise just be ideas. Things I wanted to try, but didn't. Actually being able to try all the ideas I have, before settling on some of them, is the kind of experience that gets me to stick with tools over time. It helps me realize more of my ideas, letting me turn more of them into tangible things.

The trick, really, is to not let it outpace your competence. Do the same series of steps you'd when writing code, but have the AI write the code. Ideally, it's the same process you'd do, just much faster.

_Create the project. Build a simple request handler. Hook up SQLite. Install an ORM. Create a data model with these fields x, y, z, and some REST endpoints for it..._

Little steps there, like _build a simple request handler_ or _create and data model and some REST endpoints for it_ seem like simple statements, but this saves enormous time for someone starting a new project.

Think of it like the magic wand in Fantasia. You can do a lot of amazing things very fast, but it's on you to be disciplined enough to not let it get out of control.

{{< youtube B4M-54cEduo >}}

## Install Claude Code

I use Anthropic. I don't use any other AIs. I keep my tooling very light. The industry is in a phase where companies will come and go, so having a stable experience means staying minimal.

```shell
$ # pick one
$ yay claude-code
$ brew install claude-code
$ apt install claude-code
```

Don't start it just yet. Treat it like a dev tool that you open after you create a directory for your next project, which we're starting now too.

```
$ mkdir hypeless_api && cd hypeless_api
$ claude
```

Check out how cool this looks.
![Claude on the CLI](ClaudeCode.png)

## The Basics

Claude Code is a CLI. You give it input, it produces output. The difference is AI generates output probabilistically instead of deterministically. The system can move very fast, but it has no real idea if what it's doing makes sense. For us, the challenge is to not let it outrun our comprehension.

I'm going to talk about it like it's just another CLI. That's how I use it. It's a weird shell for generating code quickly. If you can describe what you want, it can probably get close.

### Context Is Everything

The most important thing to understand is the context window. This is Claude's working memory. Everything you say, everything it responds with, every file it reads, every command it runs. It all accumulates in this window. When the window fills up, older content gets pushed out or compressed.

Think of it like a whiteboard. You and Claude are working together, writing on this shared surface. The more you write, the less room there is. Eventually you have to erase something to make space. What stays on the board shapes what Claude remembers and how it thinks about your project.

This has practical implications.

**Start sessions with intent.** The first things you tell Claude set the tone. If you start by having it read your main files and understand the architecture, that context persists. If you start with a messy debugging session, that noise persists too.

**Stay focused.** Jumping between unrelated tasks pollutes the window. If you're done with one thing and starting another, consider clearing or compacting.

**Let go of old context.** A session that solved a bug three hours ago is now carrying dead weight. The fix is done, but the back-and-forth is still taking up space.

### Think In Sessions

I think of each session as a focused unit of work. Start Claude, do a thing, maybe do a few related things, then stop. When I come back later, I often start fresh rather than resuming.

This isn't about the tool forcing you to work this way. It's about working with the grain of how context works. A clean context window means Claude has room to think about what matters now, not what mattered two hours ago.

Some sessions are exploratory. You're poking around, reading files, understanding a codebase. These fill the context with useful information. Other sessions are executional. You know what you want and you're getting it done. These benefit from starting with just enough context to do the work.

`/init` creates a `CLAUDE.md` file that persists across sessions. This is where you put the stuff you always want Claude to know. Project structure, conventions, key files. It's like pinning something to the whiteboard so it never gets erased.

### Interacting With It

Claude Code is a conversation, not a batch job. You watch it work and steer as needed.

When Claude starts going the wrong direction, hit `esc` to interrupt. Don't wait for it to finish generating something you don't want. Stop it, explain what's wrong, and point it the right way. Getting comfortable with this takes practice, but it's key to using the tool well.

Up arrow recalls your previous prompts. Tab autocompletes file paths. Shift+Tab lets you add newlines if you want to write a longer prompt.

Slash commands control the session itself.

| Command    | What it does                                |
|------------|---------------------------------------------|
| `/help`    | List available commands                     |
| `/init`    | Initialize Claude Code for a project        |
| `/clear`   | Empty the conversation context              |
| `/compact` | Compress history to free up context space   |
| `/config`  | View and change settings                    |
| `/plugins` | Install and manage plugins                  |
| `/agents`  | See running background agents               |

`/clear` wipes the slate. `/compact` summarizes and compresses, keeping the gist while freeing space. Use `/clear` when switching tasks entirely. Use `/compact` when you want to continue but need room.

Adding skills or plugins to your environment adds more commands too.


## Agents, Skills, Hooks, & Plugins

Claude Code can be extended. Agents are workers it spawns on its own. Skills are commands you invoke. Hooks run automatically in response to events. Plugins bundle these together so you can install and share them.

### Agents

Agents are background workers Claude can spin up when it needs a fresh context window. You can give them an initialization prompt that sets the direction of their work. Ask Claude to explore a large codebase and it might launch an explore agent to search, leaving your context window alone until the agent is ready to report results. This keeps your main context clean while heavy lifting happens elsewhere. Run `/agents` to see what's running.

This solves a real problem. It creates alternate context windows that can be thrown away after the work is done. This allows the main context window to be constructed cleanly and intentionally.

### Skills

Skills are slash commands. You type them, they run. Let's say you've installed Anthropic's plugins for commits and PR reviews. The `commit-commands` plugin gives you `/commit` to create commits, `/commit-push-pr` to commit, push, and open a PR in one step, and `/clean_gone` to prune stale local branches. The `pr-review-toolkit` plugin gives you `/review-pr` to run a comprehensive code review.

Skills run inside your current conversation context. They can see what you've been working on and build on it. Type `/help` to see what's available.

This solves the repetition problem. Instead of typing the same instructions every time you want to commit or scaffold a component, you make it a command. One word instead of a paragraph.

### Hooks

Hooks fire automatically when events happen. Before a tool runs, after it completes, when a session starts.

You don't invoke hooks. You configure them, and they trigger when their conditions are met. Common uses include running tests after edits, type checking after writing code, linting before commits, blocking dangerous commands like `rm -rf`, or auto-formatting files when they change.

This solves the "I forgot to run tests" problem. Humans forget. Hooks don't. Set it once and the check happens every time, automatically.

### Plugins

Plugins package agents, skills, and hooks together. They're how you extend Claude Code or share setups with others.

A plugin is just a directory with a manifest. Drop it in, and its agents, skills, and hooks become available. Run `/plugins` to see what you have installed.

This solves the setup problem. You tune your environment once, bundle it, and reuse it across projects. Or share it with your team so everyone starts from the same place.


## Tasks

Claude Code has built-in task management. When you give it complex work, it can generate a plan, break the plan into tasks, and work through them while showing progress. Run `/tasks` to see the current list.

This matters because complex work benefits from visible structure. You can see Claude's plan, catch mistakes early, and pick up where you left off if you need to stop.

The trick is getting Claude to actually use it. By default, it often just starts working without creating tasks. You have to ask for it.

### Building A Project With Tasks

Let's say we're building a link shortener. The prompts are short. Claude does the rest.

**Prompt 1:** `build a production-ready link shortener api. typescript, hono, drizzle, sqlite. create a detailed task list first.`

Claude generates something like this.

```
1. Initialize project with TypeScript, Hono, Drizzle, and SQLite — Set up the project structure with package.json, tsconfig.json, and install dependencies: hono, drizzle-orm, better-sqlite3, @types/better-sqlite3, typescript, tsx, drizzle-kit. Configure scripts for dev, build, and db migrations.
2. Define Drizzle schema for links table — Create src/db/schema.ts with links table: id (primary key), originalUrl (text, not null), shortCode (text, unique, indexed), clicks (integer, default 0), createdAt (timestamp), expiresAt (optional timestamp). Set up drizzle.config.ts for migrations.
3. Set up database connection and migrations — Create src/db/index.ts with SQLite connection using better-sqlite3 and Drizzle. Generate and run initial migration. Export db instance for use across the app.
4. Implement short code generation utility — Create src/utils/shortCode.ts with function to generate unique, URL-safe short codes. Consider: length (6-8 chars), character set (alphanumeric, no ambiguous chars), collision checking strategy.
5. Create link service layer — Create src/services/linkService.ts with business logic: createLink(url, customCode?), getLink(code), incrementClicks(code), deleteLink(code), getLinkStats(code). Handle validation, uniqueness, and expiration logic.
6. Build Hono API routes — Create src/routes/links.ts with endpoints: POST /api/shorten, GET /api/links/:code/stats, DELETE /api/links/:code. Create src/routes/redirect.ts for GET /:code redirect handler.
7. Add input validation with Zod — Install zod and @hono/zod-validator. Create src/validators/linkValidator.ts with schemas for URL validation (valid URL format, optional custom code constraints).
8. Implement error handling middleware — Create src/middleware/errorHandler.ts with centralized error handling. Define custom error classes (NotFoundError, ValidationError, ConflictError). Return consistent JSON error responses.
9. Add rate limiting middleware — Implement rate limiting for production readiness. Create src/middleware/rateLimiter.ts using in-memory store. Configure different limits for creation (stricter) vs redirect (lenient) endpoints.
10. Create main app entry point — Create src/index.ts that initializes Hono app, applies middleware (error handling, rate limiting, CORS, logging), mounts routes, and starts server. Add health check endpoint GET /health.
11. Add environment configuration — Create src/config.ts to load environment variables: PORT, DATABASE_URL, BASE_URL (for generating full short URLs), RATE_LIMIT settings. Add .env.example with documented defaults.
12. Write tests for core functionality — Set up vitest. Create tests for: short code generation, link service operations, API endpoint responses (create, redirect, stats, delete, error cases).
```

**Prompt 2:** `skip docker and linting. 6 character codes. add api key auth for creating links. add a task for custom short codes. start.`

Claude updates the list and begins. You'll see tasks marked in progress and completed as it goes.

That's it. One prompt to get the plan, one prompt to tune it, then watch it work.

### Other Examples

Here are a few more task lists Claude might generate for different kinds of work.

**Refactoring a payment module**

```
1. Identify all payment method implementations
2. Extract common interface
3. Create PaymentStrategy base class
4. Convert Stripe implementation to strategy pattern
5. Convert PayPal implementation to strategy pattern
6. Update payment service to use strategies
7. Verify existing tests still pass
```

**Investigating a bug**

```
1. Reproduce the 500 error locally
2. Check application logs for stack traces
3. Review recent commits to checkout flow
4. Add logging to narrow down failure point
5. Identify root cause
6. Implement fix
7. Verify fix resolves the issue
```

**Exploring an unfamiliar codebase**

```
1. Identify entry points (main files, CLI commands)
2. Map the directory structure
3. Find database models and schemas
4. Trace a request through the API layer
5. Document key abstractions and patterns
6. Summarize architecture in CLAUDE.md
```

Each of these gives Claude a clear path. You review the plan, adjust it, and let it run.
