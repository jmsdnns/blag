---
title: "Claude basics"
date: 2026-01-25
image: images/tech/hypeless-ai/basics.jpg
series: "Hypeless AI"
weight: 1
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

# The Basics

Claude Code is a CLI. You give it input, it produces output. The system can generate lots of code and move very fast, but it has no real idea if what it's doing makes sense. For us, the challenge is to not let it outrun our comprehension.

I'm going to talk about it like it's just another CLI. That's how I use it. It's a weird shell for generating code quickly. If you can describe what you want, it can probably get close.


## Context Windows

The most important thing to understand is the context window. A chat is a context window, but agents get their own context windows too. The context loaded into any AI task becomes Claude's working memory. Everything you say, everything it responds with, every file it reads, every command it runs. It all accumulates in this window, representing the stuff it _has in mind_.

Think of it like a whiteboard. You and Claude are working together, writing on this shared surface. The more you write, the less room there is. Eventually you have to erase something to make space. What stays on the board shapes what Claude remembers and how it thinks about your project.

This has practical implications.


## Think In Sessions

I think of each session as a focused unit of work. Start Claude, do a thing, maybe do a few related things, then stop. When I come back later, I often start fresh rather than resuming.

This isn't about the tool forcing you to work this way. It's about working with the grain of how context works. A clean context window means Claude has room to think about what matters now, not what mattered two hours ago.

Some sessions are exploratory. You're poking around, reading files, understanding a codebase. These fill the context with useful information. Other sessions are executional. You know what you want and you're getting it done. These benefit from starting with just enough context to do the work.

- **Start sessions with intent.** The first things you tell Claude set the tone and direction. If you start by having it read your main files to understand the architecture, the answers it generates for questions about the architecture will be better. Be intentional about what goes in each context window and the output will be better.

- **Stay focused.** Jumping between unrelated tasks pollutes the window. If you're done with one thing and about to start another, close claude and open it again to start a new session.

- **Let go of old context.** A session that solved a bug three hours ago is now carrying dead weight. The fix is done, but the back-and-forth is still taking up space. You can try to compact it, but the dead weight might still get carried over. It's better to start a new session.

- **`/init` your repos**. This creates a `CLAUDE.md` file that persists across sessions. This is where you put the stuff you always want Claude to know. Project structure, conventions, key files. It's like pinning something to the whiteboard so it never gets erased.


## Interacting With It

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


# Agents, Skills, Hooks, & Plugins

Claude Code can be extended. Agents are workers it spawns on its own. Skills are commands you invoke. Hooks run automatically in response to events. Plugins bundle these together so you can install and share them.

## Agents

Agents are background workers Claude can spin up when it needs a fresh context window. You can give them an initialization prompt that sets the direction of their work. Ask Claude to explore a large codebase and it might launch an explore agent to search, leaving your context window alone until the agent is ready to report results. This keeps your main context clean while heavy lifting happens elsewhere. Run `/agents` to see what's running.

This solves a real problem. It creates alternate context windows that can be thrown away after the work is done. This allows the main context window to be constructed cleanly and intentionally.

## Skills

Skills are slash commands. You type them, they run. Let's say you've installed Anthropic's plugins for commits and PR reviews. The `commit-commands` plugin gives you `/commit` to create commits, `/commit-push-pr` to commit, push, and open a PR in one step, and `/clean_gone` to prune stale local branches. The `pr-review-toolkit` plugin gives you `/review-pr` to run a comprehensive code review.

Skills run inside your current conversation context. They can see what you've been working on and build on it. Type `/help` to see what's available.

This solves the repetition problem. Instead of typing the same instructions every time you want to commit or scaffold a component, you make it a command. One word instead of a paragraph.

## Hooks

Hooks fire automatically when events happen. Before a tool runs, after it completes, when a session starts.

You don't invoke hooks. You configure them, and they trigger when their conditions are met. Common uses include running tests after edits, type checking after writing code, linting before commits, blocking dangerous commands like `rm -rf`, or auto-formatting files when they change.

This solves the "I forgot to run tests" problem. Humans forget. Hooks don't. Set it once and the check happens every time, automatically.

## Plugins

Plugins package agents, skills, and hooks together. They're how you extend Claude Code or share setups with others.

A plugin is just a directory with a manifest. Drop it in, and its agents, skills, and hooks become available. Run `/plugins` to see what you have installed.

This solves the setup problem. You tune your environment once, bundle it, and reuse it across projects. Or share it with your team so everyone starts from the same place.
