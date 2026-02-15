---
title: "Structuring work"
date: 2026-02-13
image: images/tech/hypeless-claude-code/work.jpg
series: "Hypeless Claude Code"
weight: 6
draft: true
description: >
    Tools and techniques for giving agents structure: plan mode, task lists, and git worktrees for parallel sessions.
tags:
    - AI
---

Agents drift. Give one a vague prompt and it'll start writing code immediately, making decisions you didn't ask for, solving problems you didn't have. The longer a session runs without structure, the worse this gets.

The fix is making the plan visible. Break work into steps before any code gets written, review those steps, then let the agent execute. Every tool in this post is a different take on that idea, arranged from simplest to most involved. Start with what fits your work and add more when you feel the friction.

# No Plan

By default, Claude Code just starts working. You say "build a link shortener" and it starts writing files. Sometimes this is fine. For small, well-defined tasks, you don't need a plan. But for anything with more than a few moving parts, this is where drift starts. The agent makes assumptions, picks patterns you wouldn't have picked, and by the time you notice, it's three files deep in the wrong direction.

# Plan Mode

The first intervention is making the agent think before it acts. Claude Code has a plan mode that separates thinking from doing. The agent writes a plan, you review it, and only then does it start executing. The review gate prevents the agent from racing ahead with a bad approach.

Tell Claude to store the plan in a `PLAN.md` with a checklist and update it as it works. Say you ask it to add rate limiting to an API. It produces something like:

```markdown
# Plan: Add Rate Limiting to API

## Approach
In-memory sliding window counter, keyed by IP. No external dependencies.

## TODO
- [ ] Create src/middleware/rateLimiter.ts
      - Configurable window size and max requests
      - Return 429 with Retry-After header when exceeded
      - Clean up expired entries every 60s
- [ ] Add rate limit config to src/config.ts
- [ ] Apply middleware in src/index.ts
      - Global limit on all routes, stricter limit on auth endpoints
- [ ] Add tests in tests/rateLimiter.test.ts
```

You review it, adjust if needed, and Claude starts executing, checking off items as it goes. The file survives context window resets and session endings. Start a new session, tell Claude to read `PLAN.md`, and it picks up where it left off.

# Task Lists

A plan is good. A structured plan is better. Claude Code has built-in task management that goes a step further than plan mode. It breaks the plan into discrete tasks and shows progress as it works through them. Run `/tasks` to see the current list.

The trick is getting Claude to actually use it. By default, it often just starts coding without creating tasks. You have to ask.

Let's say we're building a link shortener. The prompts are short. Claude does the rest.

**Prompt 1:** `build a production-ready link shortener api. typescript, hono, drizzle, sqlite. create a detailed task list first.`

![Screenshot](ActualTaskList.png)

I could tell Claude to add or remove tasks or I could tell it to just get started. Once it starts working, you'll see tasks marked _in progress_ or _completed_ as it gets through the work.

# Git Worktrees

At some point one agent isn't enough. You've got auth to build, tests to write, and a migration to run, and they're all independent. Git worktrees let you run multiple agents in parallel on the same repo.

A worktree is a second (or third, or fourth) working directory linked to the same git repository. Each worktree has its own branch and its own files on disk, but they share the same `.git` history. This means you can have multiple Claude sessions running at the same time, each on a different branch, without them stepping on each other's files.

```shell
# create a worktree for a new feature branch
git worktree add ../myproject-auth feature/auth

# create another for a different task
git worktree add ../myproject-tests feature/test-coverage
```

Now you have three directories:

```
myproject/              # main branch (your original repo)
myproject-auth/         # feature/auth branch
myproject-tests/        # feature/test-coverage branch
```

Open a Claude session in each one. They're fully independent. Different files, different branches, different context windows. But they share the same commit history, so merging is just a normal `git merge`.

The reason worktrees pair well with agents is isolation. An agent working on auth can't accidentally break the test suite another agent is writing. Each session has a clean working directory. When both are done, you merge their branches like you would with any two developers.

The workflow:

1. Identify two or three independent pieces of work
2. Create a worktree and branch for each
3. Open a Claude session in each worktree
4. Let them run in parallel
5. Review and merge each branch when it's done

A few practical notes:

- **Name worktree directories clearly.** You'll have multiple terminals open. `myproject-auth` is better than `worktree-1`.
- **Keep the main repo clean.** Do your work in worktrees and merge back to main when features are done.
- **Clean up when finished.** `git worktree remove ../myproject-auth` removes the directory and unlinks it.
- **Watch for lockfiles.** If two worktrees both install dependencies, they'll have separate `node_modules`. This is fine, just be aware of the disk space.

```shell
# list active worktrees
git worktree list

# remove a finished worktree
git worktree remove ../myproject-auth

# prune stale worktree references
git worktree prune
```

# Start Simple

These tools sit on a spectrum. You don't need all of them, and you shouldn't reach for the complex end until the simple end stops working.

**Start here:** Use plan mode. Store the plan in a `PLAN.md`. This costs nothing and works immediately.

**Add structure when plans aren't enough:** Ask Claude for a task list. Built-in tasks give the plan teeth without any extra tooling.

**Add parallelism when one agent is a bottleneck:** Git worktrees let you run multiple agents safely on separate branches.

Once you're running multiple agents across sessions, you'll hit the next problem: memory. Agents forget everything when a session ends. The {{< ref "memory" >}} post covers tools that solve this, from file-based planning to Taskmaster and beads.
