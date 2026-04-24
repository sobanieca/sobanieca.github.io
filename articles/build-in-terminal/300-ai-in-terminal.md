---
title: "How to use AI in terminal"
excerpt: "How to use AI in terminal without headache?"
date: 2026-03-10
---

TODO: write

- AI in terminal - `Claude Code` (git diff to review local changes, github PR to
  view bigger refatoring, adjust `notify` script to get notification in
  terminal)

- How to configure MCP's

How to configure Claude MCP for Chrome (mentioned in build-anywhere category)

Add the following to your `.claude.json`:

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
