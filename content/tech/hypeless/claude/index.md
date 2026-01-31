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
![Claude on the CLI](Claude.png)

## The Basics

Claude Code is a CLI. You give it input, it produces output. The difference is AI generates output probabilistically instead of deterministically. The system can move very fast, but it has no real idea if what it's doing makes sense. For us, the challenge is to not let it outrun our comprehension.

I'm going to talk about it like it's just another CLI. That's how I use it. It's a weird shell for generating code quickly. If you can describe what you want, it can probably get close.

`esc` is how you navigate the TUI. Hit it to interrupt generation, back out of prompts, or cancel. If you see Claude thinking out loud and it's going down the wrong path, hit `esc` and redirect. Don't wait for it to finish—intervene early and tell it what to do instead.

| Command    | What it does                                |
|------------|---------------------------------------------|
| `/help`    | List available commands                     |
| `/init`    | Initialize Claude Code for a project        |
| `/clear`   | Empty the conversation context              |
| `/config`  | View and change settings                    |
| `/plugins` | Install and manage plugins                  |
| `/agents`  | See running background agents               |
| `/compact` | Compress history to free up context space   |

Adding either skills or plugins to your environment adds more commands too.


## Agents, Skills, Hooks, & Plugins

Claude Code can be extended. Agents are workers it spawns on its own. Skills are commands you invoke. Hooks run automatically in response to events. Plugins bundle these together so you can install and share them.

### Agents

Agents are background workers Claude spins up when tasks get complex. Ask it to explore a large codebase and it might launch an explore agent to search without burning your context window.

You can tell Claude to use a specific agent, or let it decide on its own. They run in their own context, separate from your conversation, and return a summary when they're done. This keeps your main context clean while heavy lifting happens elsewhere. Run `/agents` to see what's running.

This solves a real problem: exploring a large codebase can burn through your context window fast. Agents let you search broadly without losing the thread of your actual conversation.

### Skills

Skills are slash commands. You type them, they run. `/commit` stages changes and writes a commit message. `/review-pr` reviews a pull request. `/test` runs your test suite. `/explain` breaks down how some code works. `/pr` creates a pull request with a summary.

Skills run inside your current conversation context. They can see what you've been working on and build on it. Type `/help` to see what's available.

This solves the repetition problem. Instead of typing the same instructions every time you want to commit or scaffold a component, you make it a command. One word instead of a paragraph.

### Hooks

Hooks fire automatically when events happen—before a tool runs, after it completes, when a session starts, etc.

You don't invoke hooks. You configure them, and they trigger when their conditions are met. Common uses: run tests after edits, type check after writing code, lint before commits, block dangerous commands like `rm -rf`, or auto-format files when they change.

This solves the "I forgot to run tests" problem. Humans forget. Hooks don't. Set it once and the check happens every time, automatically.

### Plugins

Plugins package agents, skills, and hooks together. They're how you extend Claude Code or share setups with others.

A plugin is just a directory with a manifest. Drop it in, and its agents, skills, and hooks become available. Run `/plugins` to see what you have installed.

This solves the setup problem. You tune your environment once, bundle it, and reuse it across projects. Or share it with your team so everyone starts from the same place.

## Tasks

Claude Code has built-in task management. When you give it complex work, it can generate a plan for getting all the work done, break the plan into a series of tasks, run tasks, track progress, and show progress. You can have each task handled by a fresh agent with a fresh context window too. When it comes to running tasks, we can imagine an agent is similar to a request handler, in that the context for the work is reset for each request. Having the agent run skills is not that different from a request handler calling its own functions. _Here are the inputs, give me the output when it's ready_.

run skills and hooks can ensure quality standards are met.
Run `/tasks` to see the current list.

This matters because complex work benefits from visible structure. When Claude tracks tasks explicitly, you can see its plan, catch mistakes early, and pick up where you left off if you need to stop.

The trick is getting Claude to actually use it. By default, it often just starts working without creating tasks. You have to ask for it.

### Prompting for Tasks

Be explicit. Tell Claude to create a task list before it starts working.

- **Vague**: `Add authentication to this API`
- **Better**: `Add authentication to this API. Create a task list first so I can see the plan before you start.`
- **Even better**: `Add authentication to this API. Before writing any code, create a task list breaking down each step. Mark tasks as you complete them so I can track progress.`

### Examples

Here are prompts that reliably get Claude to use tasks well:

- `I want to add user registration. Create a task list with all the steps—schema changes, routes, validation, etc. Don't start coding until I approve the plan.`
- `Refactor the payment module to use the strategy pattern. Break this into tasks, show me the list, then work through them one at a time.`
- `Users are reporting intermittent 500 errors on checkout. Create tasks for your investigation—what you'll check, in what order. Update the list as you find things.`
- `I'm new to this repo. Create a task list to explore the architecture—entry points, data flow, key abstractions. Summarize each as you go.`

### Reviewing the Plan

Once Claude creates tasks, you can review before it starts. This is where you catch scope creep or missing steps.

- `Hold on, you don't need to add rate limiting for this. Remove that task and proceed with the rest.`
- `You missed error handling for the OAuth callback. Add a task for that, then continue.`

The task list becomes a contract. Claude works through it, you see progress, and the work stays focused.
