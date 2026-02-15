---
title: "Memory"
date: 2026-02-14
image: images/tech/hypeless-claude-code/memory.jpg
series: "Hypeless Claude Code"
weight: 7
draft: true
description: >
    Agents forget everything between sessions. Here's how people solve that with CLAUDE.md, file-based plans, Taskmaster, beads, memory blocks, and multi-agent coordination.
tags:
    - AI
---

Every new session starts from scratch. The agent doesn't know what it built yesterday, what decisions were made, or what's left to do. Steve Yegge calls this the "50 First Dates" problem. Context windows fill up, sessions end, and the plan disappears.

If your work fits in a single session, this doesn't matter. But for anything that spans multiple sittings, you need memory that outlives the session. The tools here are different approaches to the same problem, arranged from simplest to most involved.

# Project Memory Files

The most basic form of persistent memory is already built in. Every time Claude Code starts a session, it reads a file called `CLAUDE.md` from your project root. Whatever is in that file becomes part of the agent's context before you type your first prompt. It's startup memory. The stuff the agent knows before you say anything.

This is where you put things the agent should always know: how to run tests, what frameworks you use, coding conventions, architectural patterns, anything you'd otherwise repeat every session. Run `/init` and Claude will generate one for you based on your codebase, or write it by hand.

```markdown
# Project

Link shortener API. TypeScript, Hono, Drizzle, SQLite.

# Commands

- `npm run dev` starts the dev server
- `npm run test` runs vitest
- `npm run build` compiles TypeScript
- `npm run db:migrate` runs Drizzle migrations

# Conventions

- Use Zod for all input validation
- Return consistent JSON error responses: { error: string, code: number }
- All routes go in src/routes/, services in src/services/
- Tests live next to the code they test: foo.ts → foo.test.ts
```

Keep it short. The whole file goes into the context window every session, so every line competes for attention with the actual work. Practitioners consistently find that lighter files lead to better instruction-following. If your `CLAUDE.md` is over 300 lines, the agent starts ignoring parts of it.

## Per-Directory Memory

Claude Code doesn't just read one `CLAUDE.md`. It discovers them at multiple levels. Starting from your working directory, it walks up toward the filesystem root and loads every `CLAUDE.md` it finds. So in a monorepo, you might have:

```
myproject/
├── CLAUDE.md                # project-wide conventions
├── src/
│   ├── api/
│   │   └── CLAUDE.md        # API-specific patterns
│   ├── frontend/
│   │   └── CLAUDE.md        # React conventions
│   └── shared/
│       └── CLAUDE.md        # shared library rules
└── CLAUDE.local.md          # personal prefs (gitignored)
```

The root file holds what applies everywhere. Test commands, commit conventions, the project's tech stack. The nested files hold what's specific to that part of the codebase. The API `CLAUDE.md` might say "all endpoints return paginated responses using this shape." The frontend one might say "use server components by default, client components only when you need interactivity."

Subdirectory files load on demand. They're not read at startup but get picked up when Claude reads files in that directory during the session. This keeps context lean. The agent only learns about API conventions when it's actually working on API code.

There's also `CLAUDE.local.md` for personal preferences you don't want to commit. Your editor setup, your preferred verbosity level, shortcuts you use. And `~/.claude/CLAUDE.md` for preferences that apply across all your projects.

The hierarchy works well for teams. The root `CLAUDE.md` is shared knowledge everyone agrees on. Nested files are owned by the people who work in that part of the codebase. Personal files stay personal.

# Plan Memory

`CLAUDE.md` gives the agent persistent context about the project. But it doesn't track what's been done or what's left to do. For that, you need a plan file.

The simplest approach: keep a `PLAN.md` in your repo with a checklist. Tell the agent to read it at the start of each session and update it as it works.

An earlier post in the series, on [structuring work]({{< ref "work" >}}), covered storing plans as markdown with `- [ ]` checkboxes that cover progress. This approach works across sessions because the file is on disk, not in the context window. Start a new session, tell Claude to read `PLAN.md`, and it picks up where it left off.

Here's what one looks like mid-project:

```markdown
# Plan: Link Shortener API

## Done
- [x] Project setup: Hono, Drizzle, SQLite
- [x] Create links table with short code, target URL, click count
- [x] POST /links endpoint with Zod validation

## In Progress
- [ ] GET /:code redirect endpoint
  - Increment click count on each redirect
  - Return 404 for unknown codes

## TODO
- [ ] GET /links/:id stats endpoint
- [ ] Rate limiting middleware
- [ ] Add tests for all endpoints
```

The tradeoff is discipline. Agents tend to stop updating plan files as they get deep into implementation. After about 50 tool calls, they start forgetting the original goal entirely. This is a known "lost in the middle" effect. Some people set up a Claude Code hook that reminds the agent to check the plan file periodically. Others just re-paste "read PLAN.md and update it" every few prompts.

It's low-tech, it requires babysitting, and it works well enough for a lot of projects.

# Plan Tools for Agents

Plan files work, but they depend on the agent choosing to read and update them. The next step is tools designed specifically for agents to interact with. Structured task stores where the agent queries what's ready, claims work, and updates status through purpose-built commands or tool calls instead of editing markdown.

## Taskmaster

[Taskmaster](https://github.com/eyaltoledano/claude-task-master) comes from the Cursor and Windsurf world. It's an MCP server that gives agents a structured task management system, a step up from markdown files.

You start by writing a PRD, a product requirements document describing what you want to build. Taskmaster parses it into a structured set of tasks with dependencies, subtasks, and complexity estimates. Tasks live in a `.taskmaster/` directory as JSON files. From there you work through them in your editor's AI chat. Ask "what's the next task?" and it gives you the highest-priority unblocked item.

It's popular because it works with whatever editor and model you're already using. It supports Claude, GPT, Gemini, and others. The MCP integration means tasks show up as tools the agent can call, keeping the task state in sync as work progresses.

Tasks are stored as JSON in `.taskmaster/tasks/` with dependencies, status, and test strategies:

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Setup Express Server",
      "status": "done",
      "dependencies": [],
      "priority": "high",
      "details": "Create Express app with CORS and error handling",
      "testStrategy": "Verify health check endpoint responds"
    },
    {
      "id": 2,
      "title": "Create User Authentication",
      "status": "pending",
      "dependencies": [1],
      "priority": "high",
      "details": "JWT-based login and register endpoints",
      "testStrategy": "Test login with valid/invalid credentials"
    }
  ]
}
```

The CLI is straightforward:

```shell
task-master parse-prd your-prd.txt   # generate tasks from a PRD
task-master list                      # view all tasks
task-master next                      # what should I work on?
task-master set-status --id=1 --status=done
task-master expand --id=2 --num=3    # break a task into subtasks
```

Where Taskmaster differs from plan files is enforcement. The task state lives in structured JSON, not markdown that the agent might forget to update. Dependencies are tracked explicitly. A task can't start until its blockers are resolved. And because it's an MCP server, the agent interacts with it through tool calls rather than file reads, which keeps the loop tighter.

## Beads

[Beads](https://github.com/steveyegge/beads) is the most opinionated tool here. Steve Yegge built it after spending most of 2025 on agent orchestrators. Four of them, three of which failed. Beads is what survived.

The core argument: agents can't manage work with markdown files. They write a plan in `TODO.md`, start coding, and never update it. Over a long session the plan and the actual state of the project diverge completely. The markdown rots. Structured JSON (like Taskmaster) is better, but beads goes further with a full dependency graph.

Beads replaces plans with a git-backed graph of issues. Each bead is a structured record stored as JSONL in a `.beads/` directory. They have hash-based IDs like `bd-a1b2` (designed to avoid merge conflicts when multiple agents work in parallel), dependency tracking between tasks, and a proper state machine for status. Agents can query which tasks are ready, claim work atomically, and update status as they go.

The CLI is how agents interact with it:

```shell
bd init                              # initialize beads in a repo
bd create "Add search feature" -p 2 -t feature
bd ready                             # show unblocked tasks
bd update bd-a1b2 --claim            # claim a task
bd close bd-a1b2 --reason "Implemented"
```

Each bead is a JSONL record:

```json
{
  "id": "bd-kwro",
  "title": "Add search feature",
  "status": "open",
  "priority": 2,
  "issue_type": "feature",
  "dependencies": [
    {
      "depends_on_id": "bd-f14c",
      "type": "blocks"
    }
  ]
}
```

The dependency graph is the key idea. Instead of a flat list, beads know which tasks block other tasks. An agent can run `bd ready` and get back only the tasks whose dependencies are satisfied. Agents don't have to reason about ordering. The graph handles it.

Beads is built for multi-agent workflows. All worktrees in a repo share the same `.beads` database in the main repository, so multiple agents in different worktrees see the same task graph. One agent finishes a task, marks it done, and the others immediately know.

## MCP Agent Mail

Beads gives agents shared memory. [MCP Agent Mail](https://github.com/steveyegge/mcp_agent_mail) gives them messaging.

Built by Jeffrey Emanuel and adopted by Yegge for his orchestration work, Agent Mail is an email-like communication layer for coding agents. Each agent registers an identity, gets an inbox, and can send messages to other agents. It also provides file reservations. An agent can claim a file so others know not to edit it, preventing merge conflicts before they happen.

Agents register identities and communicate through MCP tool calls. These aren't Python imports. They're tools the MCP server exposes that the agent calls on its own:

```python
# register an agent
register_agent(
    project_key="/path/to/repo",
    name="GreenCastle",
    program="Claude Code",
    task_description="Backend API development"
)

# send a message to another agent
send_message(
    sender_name="GreenCastle",
    to=["BlueLake"],
    subject="API contract for /users endpoint",
    body_md="Proposed schema for the users endpoint...",
    thread_id="bd-123"
)

# reserve files so no one else edits them
file_reservation_paths(
    agent_name="GreenCastle",
    paths=["src/api/**", "src/models/user.py"],
    ttl_seconds=3600,
    exclusive=True,
    reason="bd-123: Refactoring user endpoints"
)
```

The key insight is that agents are naturally good at email. They know how to compose messages, check inboxes, and reply to threads with zero training. You don't need a special protocol or a new abstraction. Email is already in the training data.

Combine Agent Mail with beads and something interesting happens: agents self-organize. Give a group of agents a task list and a way to message each other, and they'll divide up the work, assign roles, and coordinate. Yegge calls this an "agent village." It's not fully autonomous, but it's more coordination than you'd expect from tools this simple.

# Memory Management Agents

Everything above stores memory as files or records on disk, and the agent interacts with them through commands or tool calls. A different approach is giving agents direct control over their own memory. Tools specifically for reading, writing, and organizing what they remember. Instead of you telling the agent "read PLAN.md," the agent decides what to store and what to forget.

This idea goes by different names. Letta calls it "agentic memory." The research community calls it "self-managed context." Whatever you call it, the core concept is the same: memory as a first-class capability the agent operates on, not a file you hope it reads.

## Letta

[Letta](https://www.letta.com/) (formerly MemGPT) came out of UC Berkeley research and treats the LLM like an operating system managing its own memory. It organizes memory into tiers: core memory that's always in the context window, recall memory for conversation history, and archival memory backed by a vector store for overflow.

The core memory tier uses structured blocks, labeled sections compiled into XML and injected into every prompt:

```xml
<memory_blocks>
  <persona>
    <description>Identity and behavior of this agent</description>
    <metadata>chars_current=128, chars_limit=5000</metadata>
    <value>I am a coding assistant working on a link shortener API.
    I prefer concise solutions and always write tests.</value>
  </persona>
  <project_status>
    <description>Current state of the project</description>
    <metadata>chars_current=95, chars_limit=5000</metadata>
    <value>Auth endpoints done. Rate limiting done. Short code
    generation needs collision handling. Tests at 60% coverage.</value>
  </project_status>
  <decisions>
    <description>Architectural decisions made so far</description>
    <metadata>chars_current=112, chars_limit=5000</metadata>
    <value>Using in-memory rate limiting (no Redis yet). 6-char
    codes with alphanumeric charset. JWT for API key auth.</value>
  </decisions>
</memory_blocks>
```

The agent sees these blocks in every prompt. Each block has a character limit, so the agent has to be selective about what it stores. It summarizes and prioritizes rather than dumping everything into memory. When something ages out of core memory, the agent can push it to archival storage and retrieve it later via search.

In code, you create an agent with its memory blocks and then interact with it through messages:

```python
from letta_client import Letta

client = Letta(api_key=os.getenv("LETTA_API_KEY"))

# create an agent with memory blocks
agent = client.agents.create(
    model="openai/gpt-4o-mini",
    memory_blocks=[
        {"label": "persona", "value": "I am a coding assistant for a link shortener API."},
        {"label": "project_status", "value": "Just started. No code written yet."},
        {"label": "decisions", "value": ""}
    ]
)

# the agent reads and updates its own memory as you talk to it
response = client.agents.messages.create(
    agent_id=agent.id,
    input="Let's use Hono and SQLite. JWT for auth."
)

# you can also update memory blocks directly
client.agents.blocks.update(
    agent_id=agent.id,
    block_label="project_status",
    value="Auth endpoints done. Rate limiting done. Tests at 60%."
)
```

The agent will update its own memory blocks during conversation. Tell it you decided on JWT and it writes that to the decisions block on its own. Next session, those blocks are back in the prompt and the agent remembers.

Blocks can be shared across agents too. Attach the same block to multiple agents and they all see the same state. Update it from one and the others pick up the change.

Letta recently introduced [context repositories](https://www.letta.com/blog/context-repositories) for coding agents, storing memory as files in a git-backed repository. Agents manage memory by editing files, every change gets versioned with a commit, and multiple subagents can work concurrently using git worktrees.

## Mem0

[Mem0](https://mem0.ai/) takes a different shape. Instead of blocks in the context window, Mem0 is an external memory layer that extracts facts from conversations, stores them, and retrieves relevant ones for future sessions.

The agent doesn't manage memory blocks directly. Instead, Mem0 watches the conversation, identifies facts worth remembering, and stores them. Next session, Mem0 retrieves whatever's relevant to the current context and injects it.

```python
from mem0 import Memory

m = Memory()

# add memories from a conversation
messages = [
    {"role": "user", "content": "I prefer Hono over Express. Auth is using JWT."},
    {"role": "assistant", "content": "Got it, I'll use Hono with JWT auth."}
]
m.add(messages, user_id="jms")

# next session, recall what's relevant
results = m.search("what framework are we using?", user_id="jms")
```

Mem0 extracts facts like "prefers Hono over Express" and "auth is using JWT" from that conversation automatically. You don't tag or label anything. It figures out what's worth keeping.

Mem0 also has a graph variant (Mem0g) that stores relationships between facts, enabling multi-hop reasoning. "Who blocked the migration?" leads to "the schema change," which leads to "the decision to switch from Postgres to SQLite." In benchmarks, Mem0 leads on accuracy and latency for this kind of cross-session recall.

The tradeoff compared to Letta is control. With Letta, the agent explicitly decides what to remember. With Mem0, the system decides for the agent. Less work for the agent, but less transparency about what's being stored.

## LangMem

[LangMem](https://langchain-ai.github.io/langmem/) is LangChain's SDK for agent memory. It defines three types: semantic memory (facts about the world), procedural memory (how-to knowledge like patterns, conventions, and lessons learned), and episodic memory (specific past experiences the agent can reference).

It's more of a framework for building memory than a turnkey solution. You define schemas for what to remember and LangMem extracts matching facts from conversations:

```python
from langmem import create_memory_manager
from pydantic import BaseModel, Field

class Episode(BaseModel):
    observation: str = Field(description="What happened")
    action: str = Field(description="What was done")
    result: str = Field(description="Outcome")

manager = create_memory_manager(
    "anthropic:claude-sonnet-4-5-20250929",
    schemas=[Episode],
    enable_inserts=True
)

# extract memories from a conversation
episodes = manager.invoke({"messages": conversation})
```

You decide which memory types your agent needs, how they're stored (vector database, graph, whatever), and how they're retrieved. This makes it flexible but means you're doing more of the wiring yourself.

## Rolling Your Own

You don't need any of these frameworks. The agent-managed memory pattern is simple enough to implement with a vector store and an MCP server.

The idea: give the agent a store it can write memories to and search later. The agent stores decisions, progress, context about the codebase, whatever it needs to remember across sessions. Next session, it searches for what's relevant and loads it into context.

The advantage over files is selectivity. A `PLAN.md` is all or nothing. The agent reads the whole thing or nothing. A vector store lets the agent search by meaning. "What decisions did I make about auth?" returns just the relevant memories, not everything that's ever been stored.

A few vector stores that are easy to get started with:

- [Chroma](https://www.trychroma.com/) runs embedded in Python with no server needed. Good for local, single-agent setups. `pip install chromadb` and you're going.
- [Qdrant](https://qdrant.tech/) runs as a local binary or Docker container. It has an [MCP server](https://github.com/qdrant/mcp-server-qdrant) so agents can search it through tool calls directly.
- [Pinecone](https://www.pinecone.io/) is a hosted service if you don't want to run anything yourself. No infrastructure, just an API key.
- [pgvector](https://github.com/pgvector/pgvector) adds vector search to Postgres. If you already have Postgres, this means one less thing to run.

The setup with any of these is the same. Store memories as text with embeddings. Search by similarity when you need to recall something. Wrap it in an MCP server so the agent can do this through tool calls instead of you reminding it to read a file.

```python
import chromadb

client = chromadb.Client()
memory = client.create_collection("agent_memory")

# store a decision
memory.add(
    documents=["Using JWT for API auth. 6-char alphanumeric short codes."],
    ids=["decision-001"],
    metadatas=[{"project": "shortener", "type": "decision"}]
)

# next session, search by meaning
results = memory.query(
    query_texts=["what auth approach are we using?"],
    n_results=3
)
```

What matters isn't which store you pick. It's the pattern: give the agent a way to read and write its own memory through tool calls, so memory management becomes part of its workflow rather than something you have to remind it to do.

# Memory With Parallel Agents

Once you're running multiple agents, memory gets harder. Each agent has its own context window, its own view of the world, and no automatic way to know what the others are doing. The question becomes: how do agents share what they know without stepping on each other?

The foundation for all of this is git worktrees, covered in the [structuring work]({{< ref "work" >}}) post. A worktree is a second working directory linked to the same git repository. Each worktree has its own branch and files, but they share the same `.git` history. This is what makes parallel agents practical. Each agent gets its own worktree so it can't mess up another agent's files. When it's done, you merge the branch like normal.

But worktrees only solve file isolation. They don't solve memory. If each agent is working in a separate directory, how do they know what the others have done? That's where these patterns come in.

## Shared State, Separate Work

Say you're building a link shortener and you want three agents working in parallel. You set up worktrees:

```shell
git worktree add ../shortener-auth feature/auth
git worktree add ../shortener-tests feature/tests
git worktree add ../shortener-analytics feature/analytics
```

Now you have three directories, three branches, three Claude sessions. The simplest approach: point them all at the same memory store. This is what beads does. The `.beads` database lives in the main repo, not in any individual worktree, so all worktrees see the same task graph. An agent in `myproject-auth/` marks a task done and the agent in `myproject-tests/` sees it immediately. Taskmaster's `.taskmaster/` directory works similarly.

The constraint is that agents need to work on separate parts of the codebase. Two agents editing the same file on different branches will create merge conflicts. The pattern works best when you can decompose work into independent pieces. One agent builds auth, another writes tests, a third handles the migration.

## Memory Decay

Long-running projects accumulate a lot of state. Old completed tasks, past decisions, abandoned approaches. All of it takes up space in the context window or the memory store. Beads handles this with semantic compaction: old closed tasks get summarized, preserving the gist while freeing up space. It's a form of forgetting, but deliberate forgetting. The kind that keeps the agent focused on what matters now.

This matters more than it sounds. An agent with 200 completed tasks in its context is going to perform worse than one with a 3-paragraph summary of what's been done and 15 open tasks ahead of it. Memory management isn't just about remembering. It's about knowing what to forget.

## The Coordination Tax

The practical consensus right now is that parallelism works better than full autonomy. Running 4-5 independent agents on separate worktrees, with you as the orchestrator, is proven. Fully autonomous multi-agent coordination, where agents assign work to each other, resolve conflicts, and merge branches without human involvement, is still rough.

Every layer of coordination adds overhead. Shared memory stores need conflict resolution. Communication between agents needs protocols. Merge queues need management. The more agents you run, the more time you spend on coordination instead of actual work. At some point the coordination tax exceeds the benefit of parallelism.

The sweet spot for most people is still human-as-orchestrator. You create the worktrees, decide what work goes where, open a Claude session in each one, and merge the branches when they're done. The agents handle the coding. You handle the coordination. It's less futuristic than a fully autonomous swarm, but it works today.

# Picking Your Approach

**Project memory files** are free and automatic. Every project should have a `CLAUDE.md`. Sprinkle nested files in subdirectories when different parts of the codebase need different conventions.

**Plan memory** requires nothing extra. A `PLAN.md` and some discipline. Good for projects where one person and one agent work through a multi-session task.

**Taskmaster** adds structure and enforcement through an MCP server. Good if you want persistent project-level planning that works across editors and models, without learning a new paradigm.

**Beads + Agent Mail** are for multi-agent, multi-worktree projects. Beads tracks what needs doing. Agent Mail lets agents communicate and claim files. Together they give a group of agents shared memory and a way to coordinate.

**Memory agents** are a different model entirely. The agent controls what it remembers and forgets. Letta puts structured blocks in the context window. Mem0 extracts facts automatically. LangMem gives you a framework to build your own. Or roll your own with a database and an MCP server.

For parallel agents, start with shared state and separate work. Give each agent a worktree, point them at the same task store, and keep yourself in the loop for coordination. Add more automation when you're confident the agents won't step on each other.

Start with the simplest thing that fits your work. You can always add more structure later.
