---
title: "How to use AI in terminal"
excerpt: "AI agents in form of CLI are taking development world by storm. For good reason"
date: 2026-03-10
---

# AI Agents in CLI

There are so many AI related articles and how-to's that I wouldn't dare to write
another one. In this article I only want to share few alignments when working
fully in terminal. For example the MCP configuration when working with remote
machine (as described in `build-anywhere`).

Also the way of working with AI agents entirely in terminal is a bit different
than in GUI apps like Cursor.

# Working with LLM in terminal

When running prompts in tools like `Claude Code` there is no straightforward way
of reviewing/accepting all changes that were done. That's why I suggest to get
familiar with `git` and use it as a safety net and control over all changes done
to the source code. I use bare `git` in my terminal, but I know there are some
terminal based tools that aim to make it more friendly to use. Personally I see
value in plain `git` - it gives some more confidence when using within some
CI/CD scripts. Whenever there are batch of changes generated with some prompt I
simply review them with `git diff`. In case when there are lots of changes I
tend to create PR with platform like Github. This is espeically useful because
it allows to write comments on specific lines and then tools like `Claude Code`
(using `Github CLI`) can easily download them and apply required changes.

# MCP`s configuration

Personally, I try to use as much `CLI` tools as possible but in some cases MCP
is the only proper way to integrate AI agent. For example to work with frontend,
Chrome MCP can save a lot of time. The tricky part is - how to configure it, if
you work in terminal on remote machine. For this one has to add the following to
`.claude.json` file:

```json
"mcpServers": {
  "chrome-devtools": {
    "type": "stdio",
    "command": "npx",
    "args": [
      "chrome-devtools-mcp@latest",
      "--browserUrl",
      "http://localhost:9222"
    ],
    "env": {}
  }
}
```

### Enabling Chrome remote debug

For any of this to work, something needs to actually listen on port 9222 on your
local machine. That means starting Chrome with remote debugging enabled. On
Windows:

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\{My USER}\chrome-debug"
```

The command is similar on other systems. The important part is passing
`--user-data-dir` alongside the debug port - recent Chrome versions require
both, and it took me a while to track this down, so I want to share it here.
