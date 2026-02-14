---
title: "Plugin to build APIs"
date: 2026-01-27
image: images/tech/hypeless-ai/plugin.jpg
series: "Hypeless AI"
weight: 3
draft: true
description: >
    I put together a simple plugin to give you a great first experience building REST APIs with Express, TypeScript, and Prisma. It has skills to scaffold common things, agents that know the stack, and a hook that runs type checking after edits.
tags:
    - AI
---

I put together a simple plugin to give you a great first experience building REST APIs with Express, TypeScript, and Prisma. It has skills to scaffold common things, agents that know the stack, and a hook that runs type checking after edits.

Assuming you're still in the `hypeless_api/` directory, install it:

```shell
$ git clone https://github.com/jmsdnns/hypeless .claude/plugins/hypeless
```

The structure:

```
hypeless/
├── plugin.json
├── hooks.json
├── skills/
│   ├── init-rest.md
│   ├── model.md
│   ├── route.md
│   ├── middleware.md
│   ├── service.md
│   └── review.md
└── agents/
    ├── stack-orchestrator.md
    ├── task-distributor.md
    ├── express-pro.md
    ├── typescript-pro.md
    └── prisma-pro.md
```

The agents provide deep expertise:

| Agent | Expertise |
|-------|-----------|
| `express-pro` | Routing, middleware, error handling, security |
| `typescript-pro` | Type system, strict mode, full-stack type safety |
| `prisma-pro` | Schema design, migrations, query optimization |
| `stack-orchestrator` | Routes questions to the right specialist |
| `task-distributor` | Breaks complex work into actionable tasks |

The skills use an `h:` prefix:

| Skill | Description |
|-------|-------------|
| `/h:init-rest` | Scaffold a REST API project |
| `/h:model` | Add a Prisma model and generate types |
| `/h:route` | Add CRUD endpoints for a resource |
| `/h:middleware` | Add auth, validation, logging |
| `/h:service` | Extract business logic into services |
| `/h:review` | Code review using all specialist agents |

The hook runs type checking after edits:

| Event | Action |
|-------|--------|
| `PostToolUse` (Edit/Write) | Run `tsc --noEmit` to catch type errors |

Restart Claude Code and run `/plugins` to verify it loaded. You should see `hypeless` in the list.
