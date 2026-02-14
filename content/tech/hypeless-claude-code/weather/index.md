---
title: "Add the weather to a session"
date: 2026-01-25
image: images/tech/hypeless-claude-code/weather.jpg
series: "Hypeless Claude Code"
weight: 5
draft: true
description: >
    Using the weather MCP server we built, inside Claude Code.
tags:
    - AI
---

In the [previous post]({{< ref "/tech/hypeless-claude-code/mcp" >}}) we built a weather MCP server. Now let's use it.

# Install

There are two ways to install it: at the project level or at the user level. Installing it at the project level means it is there only for claude sessions in that project. Installing it at the user level means you can use this MCP anywhere.

That registers the server at the project level, writing to `.mcp.json` in your project root.

```shell
$ claude mcp add weather -- npx tsx ./src/index.ts
```

If you want the server available everywhere, add `--scope user` to install it globally.

```shell
$ claude mcp add --scope user weather -- npx tsx ./src/index.ts
```

If you prefer to do it by hand, add the entry to `.mcp.json` in your project root. Create the file if it doesn't exist yet.

```json
{
  "mcpServers": {
    "weather": {
      "command": "npx",
      "args": ["tsx", "./src/index.ts"]
    }
  }
}
```

Claude will automatically start the weather server with the `get-forecast` tool available.

# Verify it loaded

Start a new Claude session and check that the MCP server connected. You can ask Claude directly.

```
> what MCP tools do you have available?
```

You should see `get-forecast` in the list. If it's not there, check that your `.mcp.json` is in the project root and that `npx tsx ./mcp/weather.ts` runs without errors on its own.

# Use it

Now just ask for weather. You don't need to mention MCP or tool names. Claude reads the tool descriptions and decides when to use them on its own.

```
> what's the weather in portland?
```

Claude will call `get-forecast` with `{"city": "Portland"}`, get the response, and present the result in plain language. You'll see the tool call happen in the output. Claude shows you when it's reaching for a tool.

You can also use it as part of a larger task. The tool is just another thing Claude can reach for.

```
> I'm planning a bike ride this weekend in Portland.
> Check the weather and tell me if Saturday or Sunday looks better.
```

Claude will call the tool twice, compare the results, and give you a recommendation. It's not doing anything special. It's making two tool calls and reasoning about the output, the same way it reasons about file contents or command output.

# Combine it with other tools

MCP servers get more useful when they're not alone. If you also have a calendar MCP, Claude could check your schedule and the weather in the same conversation. If you have a Slack MCP, it could post the forecast to a channel.

```
> check the weather for tomorrow in portland and post a
> summary to #team-outdoors on slack
```

Each MCP server adds one more thing Claude can do. They compose naturally because Claude treats them all the same way — tools it can call when the situation fits.

# When things go wrong

If Claude isn't using the tool when you expect it to, the problem is almost always the tool description. Go back to `mcp/weather.ts` and look at the string you passed to `server.tool()`. Claude uses that description to decide when the tool is relevant. If it says "Get the weather forecast for a city" but you're asking about zip codes, Claude might not make the connection.

If the tool is being called but returning errors, test it manually using the stdio method from the previous post. That isolates whether the problem is in your server code or in how Claude is calling it.

```shell
$ npx tsx src/index.ts
```

Then paste the JSON-RPC messages from the previous post to step through the protocol by hand.
