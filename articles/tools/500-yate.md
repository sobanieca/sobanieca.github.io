---
title: "yate: yet another text editor"
excerpt: "Agents write most of the code, but you still need to read it. A terminal editor somewhere between nano and Neovim, written in one evening."
date: 2026-11-15
---

`todoer` came from noticing that AI agents changed the way I work. The same
observation caught up with my editor.

Recently I had to update my machine setup scripts in the
[env-setup](https://github.com/sobanieca/env-setup) repository, and I realized
that I rarely open `Neovim` nowadays. Agents write most of the code, and I open
an editor only to read it, check what an agent changed or fix a line by hand. I
had spent quite a lot of time on my [Neovim setup](../build-in-terminal/400-neovim.md),
but I never liked the complexity it involved: plugins, the LSP client, its
extensions, and the config that keeps them all together.

So I decided to spend one evening on giving Claude a shot: write my own terminal
editor that matches my `Neovim` setup. Claude created a really decent result,
and a few more prompts improved it a bit. I decided to give it a try in my daily
work. That's how [yate](https://adam.sobaniec.com/yate) was born.

**Why `yate`?**

- **Simple like nano:** No modes. You type and the text goes in. The keys you
  need are shown on screen.
- **Enough for a project, like Neovim:** A file tree with git status, a fuzzy
  file finder, live grep, split view, bookmarks and git signs in the gutter.
- **Go to definition without a language server:** tree-sitter finds the
  definition in the file, follows imports, or searches the project.
- **Ctrl keys only:** Every default key is Ctrl and a letter, so it works in any
  terminal, through `tmux` and in Termux.
- **One binary, nothing to set up:** Syntax highlighting for 36 languages and a
  JavaScript engine for plugins are compiled in.

### Install

Linux and macOS:

```bash
curl -fsSL adam.sobaniec.com/yate/install.sh | bash
```

Then open a project:

```bash
cd ~/code/my-project
yate
```

`yate` opens the file tree of the current folder. `yate src/main.rs:42` opens a
file on a given line.

### Reading code the agent wrote

This is what I do with an editor most of the time now. An agent finishes its
work in one `tmux` pane, and I open `yate` in the next one:

- `Ctrl+P` finds a file, with the recently opened ones on top.
- `Ctrl+R` greps the whole project live.
- `Ctrl+G D` (or `Ctrl+click`) jumps to a definition, `Ctrl+G ←` goes back.
- The gutter marks the lines changed since the last commit, and the file tree
  can show only the changed files.

When something needs a small fix, I just type it - no mode to switch to. Then
`Ctrl+S` and back to the agent.

### Keys you don't have to remember

A few direct keys cover what you do all the time: save, find, copy, undo.
Everything else sits behind six menu keys - `Ctrl+G` go to, `Ctrl+K` bookmarks,
`Ctrl+W` panes and tabs, `Ctrl+T` file tree, `Ctrl+L` lines and `Ctrl+O`
switch. Press one and wait, and a menu with the commands pops up. Once you know
the second key, the menu doesn't show at all. `Ctrl+H` opens the command
palette, which lists what you can do right now, with the keys for it.

### Configuration

Settings live in `yate.json`: `~/.yate/yate.json` applies everywhere, and a
`yate.json` in a project overrides it. Tokyo Night is the default theme (the
same one I use in `Neovim`), with gruvbox, nord and solarized presets.

You don't have to write the config by hand. `yate skill --init` creates a skill
for Claude Code, Codex and Cursor, so you can ask an agent, for example:

> /yate use the gruvbox-dark theme and bind ctrl+e to go to definition

Plugins are plain JavaScript files in `~/.yate/plugins`. They can register
commands, key bindings and react to events.

### Good to know

- `yate` is an early release. Keys, options and the plugin API may still change
  between versions.
- I will try to maintain it properly, but the truth is - I rarely look at its
  code. It may take a while until it's polished.
- `yate update` installs the latest release.

### Conclusion

`yate` doesn't try to replace `Neovim`. It's meant for the way I use an editor
today: quick, comfortable reading and small edits in a `tmux` pane next to an AI
agent, with nothing to configure.

[https://github.com/sobanieca/yate](https://github.com/sobanieca/yate)
