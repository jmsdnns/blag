---
title: "Make an MCP server for weather"
date: 2026-01-25
image: images/tech/hypeless-ai/mcp.jpg
series: "Hypeless AI"
weight: 4
draft: true
description: >
    A simple tutorial for building an MCP server.
tags:
    - AI
---

An MCP server is just a program that exposes tools over a standard protocol. If you have an internal API, a custom database, or anything else Claude can't reach out of the box, you can wrap it in an MCP server and make it available.

They're easy enough to build that you can think of them as data duct tape for LLMs. The official SDK makes building one straightforward. You create a server, define tools with names, descriptions, and input schemas, then implement handlers for each one.

# Set up the project

Start with a directory and initialize it.

```shell
$ mkdir weather-mcp
$ cd weather-mcp
$ npm init -y
$ npm install @modelcontextprotocol/sdk zod
$ npm install -D tsx typescript @types/node
```

Create a `tsconfig.json` so TypeScript knows what we're working with.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

The server code goes in `src/`. Here's what the project looks like when we're done.

```
weather-mcp/
├── src/
│   └── index.ts       # the server
├── package.json
└── tsconfig.json
```

Three files. That's a complete MCP server.

# Write the server

Here's `src/index.ts`. A minimal server that exposes a single tool.

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "weather",
  version: "1.0.0",
});

server.tool(
  "get-forecast",
  "Get the weather forecast for a city",
  { city: z.string() },
  async ({ city }) => {
    const res = await fetch(
      `https://api.weather.example/forecast?city=${city}`
    );
    const data = await res.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

The server communicates over stdio by default. Claude launches it as a subprocess and sends JSON back and forth. The `tool` method registers a tool name, a description that tells Claude when to use it, a Zod schema for input validation, and a handler that does the actual work.

# Test it manually

You can test it yourself without Claude in the loop. The server reads JSON-RPC from stdin and writes responses to stdout. Start it up and send it messages directly.

```shell
$ npx tsx src/index.ts
```

The server is now running, waiting for input on stdin. First you initialize the connection.

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}
```

The server responds with its capabilities and the tools it offers. Then you send the initialized notification to confirm.

```json
{"jsonrpc":"2.0","method":"notifications/initialized"}
```

Now you can call a tool. This is what Claude sends when it decides to use your `get-forecast` tool.

```json
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get-forecast","arguments":{"city":"Portland"}}}
```

And the server responds with the result.

```json
{"jsonrpc":"2.0","id":2,"result":{"content":[{"type":"text","text":"{\"temp\":58,\"condition\":\"cloudy\"}"}]}}
```

That's the whole protocol. JSON-RPC over stdio. Claude does this automatically when you configure an MCP server — it launches the process, initializes the handshake, and calls tools as needed. Testing it manually like this is useful for debugging when a server isn't behaving the way you expect.

The description matters more than you'd think. Claude reads it to decide when to reach for the tool. A vague description means Claude will use it at the wrong times or not at all. Be specific about what the tool does and when it's useful.
