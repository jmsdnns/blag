---
title: "Claude basics"
date: 2026-01-25
image: images/tech/hypeless-claude-code/basics.jpg
series: "Hypeless Claude Code"
weight: 1
draft: true
description: >
    I'm going to quickly layout the gist of how I use Claude for coding. This is for anyone who is recently curious.
tags:
    - AI
---

# Overview

I'm going to quickly layout the gist of how I use Claude for coding. This is for anyone who is recently curious.

I have been having an excellent experience pulling off things with code that I wouldn't usually have the time for. For me, that is the key thing that makes AI tools worth using. It isn't just about doing the same work faster, it's also about having extra time to do things you don't usually have time for. I can get things done that would otherwise just be ideas. Things I wanted to try, but didn't. Actually being able to try all the ideas I have, before settling on some of them, is the kind of experience that gets me to stick with tools over time. It helps me realize more of my ideas, letting me turn more of them into tangible things.

The trick, really, is to not let it outpace your competence. Do the same series of steps you'd when writing code, but have the AI write the code. Ideally, it's the same process you'd do, just faster.

For example, you will be able to generate an excellent implementation of a whole REST API using the following simple prompt:

```
Use the hypeless plugin to:
- Create a new api project called hypeless_api
- Install SQLite with ORM & migrations.
- Create user model with fields: username, email, id, password
- Build REST endpoints for auth and user profiles
```

Little steps like _Create user model..._ or _Build REST endpoints..._ seem like simple statements, but from the POV of setting up a new project they represent doing all the boilerplate project creation stuff. In a way, it's the next iteration in computing's long history of building powerful automation tools. From PHP to Rails to LLMs, they're all huge steps forward with regard to building a lot of scaffolding quickly.

The non-determinism of LLMs is similar to the magic wand in Fantasia. You can do a lot of things very fast, but it's on you to be disciplined and not let it go beyond your comprehension.

{{< youtube id=B4M-54cEduo start=102 >}}

# Install Claude Code

I use Anthropic. I don't use any other AIs. I keep my tooling very light. The industry is in a phase where companies will come and go, so having a stable experience means staying minimal.

```shell
$ # pick one
$ yay claude-code
$ brew install claude-code
$ apt install claude-code
```

Don't start it just yet. Treat it like a dev tool that you open after you create a directory for your next project.

```
$ mkdir project
$ cd project
$ claude
```

Check out how 90's this looks too. Click play on [Halcyon & On & On](https://www.youtube.com/watch?v=an7m4gbrw6E) to complete the vibe.

![Claude on the CLI](ClaudeCode.png)

At this point, you could try telling Claude to build something for you. See what happens, it's worth it. Continue reading after you've kicked the tires and gotten a sense of how it works without being setup.


# The Basics

Claude Code is a CLI. You give it input, it produces output. The system can generate lots of code and move very fast, but it has no real idea if what it's doing makes sense. For us, the challenge is to not let it outrun our comprehension.

I'm going to talk about it like it's just another CLI. That's how I use it. It's a weird shell for generating code quickly. If you can describe what you want, it can probably get close.

## Interacting With It

Claude Code is a conversation, not a batch job. You watch it work and steer as needed.

When Claude starts going the wrong direction, hit `esc` to interrupt. Don't wait for it to finish generating something you don't want. Stop it, explain what's wrong, and point it the right way. Getting comfortable with this takes practice, but it's key to using the tool well.

Up arrow recalls your previous prompts. Tab autocompletes file paths. Shift+Tab lets you add newlines if you want to write a longer prompt.

Slash commands control the session itself.

| Command    | What it does                                |
|------------|---------------------------------------------|
| `/init`    | Initialize Claude Code for a project |
| `/help`    | List available commands |
| `/config`  | View and change settings. Use this to switch models, configure the UI, disable notifications, ... |
| `/clear`   | Clears the current context window. Use this when switching tasks entirely |
| `/compact` | Summarizes and compresses your current session to free space. Use this when you want to continue but need room |
| `/agents`  | Manage agent configurations |
| `/skills`  | List available skills |
| `/hooks`   | Configure hooks for tool events |
| `/plugins` | Install and manage plugins |
| `/mcp`     | Install and manage mcp servers |

Skill and plugins sometimes add commands too. More info further down.

## Context Windows

The most important thing to understand is the context window. A chat is a context window, but agents get their own context windows too. The context loaded into any AI task becomes Claude's working memory. Everything you say, everything it responds with, every file it reads, every command it runs. It all accumulates in this window, representing the stuff it _has in mind_.

Think of it like a whiteboard. You and Claude are working together, writing on this shared surface. The more you write, the less room there is. Eventually you have to erase something to make space. What stays on the board shapes what Claude remembers and how it thinks about your project.

This has practical implications because it directly affects the quality of the output you get from Claude. You'll start out bad at doing this, but you'll get the hang of it soon.

## Task Sessions

I think of each session as a focused unit of work, eg a task. I'm either going to do some work or an agent is. I start Claude, do a thing, maybe do a few related things, then stop. When I come back later, I start a fresh session.

This isn't about the tool forcing you to work this way. It's about working with the grain of how context works. A clean context window means Claude has room to think about what matters now, not what mattered two hours ago.

Some sessions are exploratory. You're poking around, reading files, understanding a codebase. These fill the context with useful information. Other sessions are executional. You know what you want and you're getting it done. These benefit from starting with just enough context to do the work.

- **Start sessions with intent.** The first things you tell Claude set the tone and direction. If you start by having it read your main files to understand the architecture, the answers it generates for questions about the architecture will be better. Be intentional about what goes in each context window and the output will be better.

- **Stay focused.** Jumping between unrelated tasks pollutes the window. If you're done with one thing and about to start another, close claude and open it again to start a new session.

- **Let go of old context.** A session that solved a bug three hours ago is now carrying dead weight. The fix is done, but the back-and-forth is still taking up space. You can try to compact it, but the dead weight might still get carried over. It's better to start a new session.

- **`/init` your repos**. This creates a `CLAUDE.md` file that persists across sessions. This is where you put the stuff you always want Claude to know. Project structure, conventions, key files. It's like pinning something to the whiteboard so it never gets erased.


# Agents, Skills, Hooks, & Plugins

Claude Code can be extended. Agents are workers it spawns on its own. Skills are commands you invoke. Hooks run automatically in response to events. Plugins bundle those together so you can install and share them.

Software devs often approach this topic expecting to see real code, but you won't find any. These tools are written entirely with markdown and frontmatter for metadata or configured in settings JSON.

## Agents

Agents are background workers Claude can spin up when it needs a fresh context window. You can give them an initialization prompt that sets the direction of their work. Ask Claude to explore a large codebase and it might launch an explore agent to search, leaving your context window alone until the agent is ready to report results. This keeps your main context clean while heavy lifting happens elsewhere. Run `/agents` to see what's running.

This solves a real problem. It creates alternate context windows that can be thrown away after the work is done. This allows the main context window to be constructed cleanly and intentionally.

An agent is a single markdown file. YAML frontmatter declares its name, tools, and model. The body is a system prompt that tells the agent what it is and how to work.

```markdown
---
name: frontend-developer
description: Expert UI engineer focused on React components
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

You are an expert UI engineer. Build high-quality React
components prioritizing maintainability and user experience.
```

Write the agent file to `.claude/agents/frontend-developer.md`, either in the project root or `$HOME`.

## Skills

Skills are slash commands. You type them, they run. Let's say you've installed Anthropic's plugins for commits and PR reviews. The `commit-commands` plugin gives you `/commit` to create commits, `/commit-push-pr` to commit, push, and open a PR in one step, and `/clean_gone` to prune stale local branches. The `pr-review-toolkit` plugin gives you `/review-pr` to run a comprehensive code review.

This solves the repetition problem. Instead of typing the same instructions every time you want to commit or scaffold a component, you make it a command. One word instead of a paragraph.

Skills run inside your current conversation context. They can see what you've been working on and build on it. Type `/help` to see what's available.

A skill lives in a directory with a `SKILL.md` file. Frontmatter has a name and description. The body is a detailed guide that gets loaded into context when invoked. It's great for concepts, code examples, best practices.

```markdown
---
name: Route Scaffolding
description: Scaffold a new REST API route with controller
version: 0.1.0
---

# Route Scaffolding

Create an Express route with a controller, following
the project's existing patterns for error handling
and response formatting...
```

Write the skill file to `.claude/skills/route-scaffolding/SKILL.md`, either in the project root or `$HOME`.

## Hooks

Hooks fire automatically when events happen. Before a tool runs, after it completes, when a session starts. You don't invoke hooks. You configure them, and they trigger when their conditions are met.

Common uses include running tests after edits, type checking after writing code, linting before commits, blocking dangerous commands like `rm -rf`, or auto-formatting files when they change.

This solves the "I forgot to do X" problem. Set it once and the check happens every time, automatically.

Here is an example that runs the TypeScript compiler after every file edit, catching type errors immediately.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsc --noEmit 2>&1 | head -20"
          }
        ]
      }
    ]
  }
}
```

Hooks are configured in `.claude/settings.json`, either in the project root or `$HOME`. Each entry specifies an event, a matcher for which tools trigger it, and a command to run. Hooks don't use markdown. They are JSON that matches LLM events with shell commands.

## Plugins

Plugins package agents, skills, and hooks together. They're how you extend Claude Code or share setups with others.

A plugin is just a directory with a manifest. Drop it in, and its agents, skills, and hooks become available. Run `/plugins` to see what you have installed.

The structure is a directory with a `.claude-plugin/plugin.json` manifest. Components are auto-discovered from conventional subdirectories.

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── agents/
│   └── my-agent.md
├── skills/
│   └── my-skill/
│       └── SKILL.md
├── commands/
│   └── my-command.md
└── hooks.json
```

The manifest is minimal. Name, description, author.

```json
{
  "name": "my-plugin",
  "description": "Brief description of what this plugin does",
  "author": {
    "name": "Your Name"
  }
}
```

This solves the setup problem. You tune your environment once, bundle it, and reuse it across projects. Or share it with your team so everyone starts from the same place.

BTW, we will build a plugin in [this post]({{< ref "plugin" >}}), later in the series.


# MCP

Model Context Protocol is how LLMs talk to external services. REST is for apps, MCP is for LLMs. Where a REST API lets your code read and write data from a service, an MCP server lets Claude do the same thing.

Load an MCP for GitHub, and Claude can check issues, review PRs, and create branches. Load one for Notion, and it can read and write your docs. Load one for Postgres, and it can query your database directly. You don't write integration code. You point Claude at an MCP server and it gains new capabilities.

Configuration lives in `.mcp.json` at the root of your project. Each entry names a server and tells Claude how to connect to it.

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": { "NOTION_TOKEN": "${NOTION_TOKEN}" }
    },
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server"],
      "env": { "LINEAR_API_KEY": "${LINEAR_API_KEY}" }
    }
  }
}
```

Once that's in place, Claude can use it without being told. Ask it to check your open PRs and it will use the GitHub MCP automatically.

This solves the integration problem. Instead of leaving Claude's context to go check GitHub or look something up in Notion, you bring those services into the conversation. Claude can act on real data from your actual tools instead of guessing based on what you paste in.

A word of caution. MCP has a reputation for poor security and excessive token usage, and both concerns are valid. The initial version of MCP didn't include auth. And, every MCP call burns tokens. If you're on a $20/month account, a few MCP integrations can easily eat through your supply.

BTW, we will build an mcp server in [this post]({{< ref "mcp" >}}), later in the series.

# Tasks

Claude Code has built-in task management. When you give it complex work, it can generate a plan, break the plan into tasks, and work through them while showing progress. Run `/tasks` to see the current list.

This matters because complex work benefits from visible structure. You can see Claude's plan, catch mistakes early, and pick up where you left off if you need to stop.

The trick is getting Claude to actually use it. By default, it often just starts working without creating tasks. You have to ask for it. Something like this works well.

```
> Build a REST API for a blog. Create a task list first, then work through
> each task one at a time. Use Express, TypeScript, and Prisma. I need
> endpoints for posts, tags, and authors.
```

That "create a task list first" part is key. Without it, Claude will just start writing code. With it, you'll see something like this show up.

```
Tasks:
  1. ✅ Initialize project with Express, TypeScript, and Prisma
  2. ⏳ Define Prisma schema for posts, tags, and authors
  3. ○ Create REST endpoints for authors
  4. ○ Create REST endpoints for tags
  5. ○ Create REST endpoints for posts
  6. ○ Add error handling middleware
```

Claude works through them in order, checking each off as it goes. Agents are spawned for each task so they are always initialized with clean context windows. They're surprisingly flexible. You can also interrupt between tasks to adjust the plan, skip something, or add new tasks. Run `/tasks` at any point to see the current state.

BTW, we will cover using tasks in [this post]({{< ref "work" >}}), later in the series.
