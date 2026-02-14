---
title: "Structuring work"
date: 2026-02-13
image: images/tech/hypeless-ai/work.jpg
series: "Hypeless AI"
weight: 6
draft: true
description: >
    I'm going to quickly layout the gist of how I use Claude for coding. This is for anyone who is recently curious.
tags:
    - AI
---

Claude Code has built-in task management. When you give it complex work, it can generate a plan, break the plan into tasks, and work through them while showing progress. Run `/tasks` to see the current list.

This matters because complex work benefits from visible structure. You can see Claude's plan, catch mistakes early, and pick up where you left off if you need to stop.

The trick is getting Claude to actually use it. By default, it often just starts working without creating tasks. You have to ask for it.

# Building A Project With Tasks

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

# Other Examples

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
