---
title: "Neovim: your terminal IDE"
excerpt: "Ultimate hacking tool"
date: 2026-03-08
---

# Why Neovim

Even with the terminal, `tmux`, and an AI agent ready to go, one piece is still
missing: the editor itself. AI generates plenty of code, but you still need a
fast, keyboard-driven place to read, navigate, and tweak it. For me that place
is `Neovim`.

It's tempting to think that in an era where AI agents write most of the code and
developers mostly review pull requests, a powerful editor matters less than it
used to. I don't buy it. Being able to jump into a codebase by hand - chase a
definition, grep for a pattern, sketch a quick experiment, fix something small
without spinning up a whole agent loop - is a skill that won't go away. It
matters even more when you're working on a remote machine over SSH, where a GUI
IDE is awkward but a terminal editor feels native.

There are other terminal editors out there, but out of all the alternatives
`Neovim` is the one that feels mature and powerful enough for full-time software
development. It also runs equally well on a beefy workstation and on a phone
over SSH, which matters a lot in the workflow described in earlier articles.

# Custom config, not a distribution

There are popular `Neovim` distributions like `LazyVim`, `NvChad`, or
`AstroNvim` that give you a polished IDE in minutes. They're a great way to get
started, but I deliberately avoid them.

The reason is simple: when something breaks - and it will break - I want to know
exactly which plugin or setting is responsible. With a hand-rolled `init.lua`
every line is there because I put it there. It also keeps the startup fast and
the surface area small enough that AI can reason about my config when I ask it
to.

If you want to see the full file, it lives in my `env-setup` repository:
[nvim-init.lua](https://github.com/sobanieca/env-setup/blob/master/nvim-init.lua).
Below I only highlight the plugins that turn `Neovim` into something close to a
full IDE.

# The plugins that matter

## Language intelligence

- [coc.nvim](https://github.com/neoclide/coc.nvim) - LSP client with a rich
  extension ecosystem (TypeScript, Deno, Lua, Terraform, Docker, YAML, ESLint,
  Prettier...). This is what gives me go-to-definition, rename, diagnostics, and
  code actions.
- [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) - proper
  syntax highlighting and indentation across 40+ languages.

## Navigation and search

- [telescope.nvim](https://github.com/nvim-telescope/telescope.nvim) - fuzzy
  finder for files, live grep, references, jumplist, and more. The single plugin
  I'd miss the most.
- [nvim-tree.lua](https://github.com/nvim-tree/nvim-tree.lua) - the file
  explorer sidebar.
- [nvim-spectre](https://github.com/nvim-pack/nvim-spectre) - project-wide find
  & replace with a real preview.
- [bookmarks.nvim](https://github.com/tomasky/bookmarks.nvim) - persistent
  bookmarks across sessions, very handy in larger codebases.

## Editing quality of life

- [Comment.nvim](https://github.com/numToStr/Comment.nvim) - smart commenting.
- [uuid-nvim](https://github.com/PauloMessias/uuid-nvim) - quick UUID generation
  in insert mode.

## Looks

- [tokyonight.nvim](https://github.com/folke/tokyonight.nvim) - the colorscheme.
- [lualine.nvim](https://github.com/nvim-lualine/lualine.nvim) - the status
  line.
- [barbecue.nvim](https://github.com/utilyre/barbecue.nvim) - breadcrumb bar
  showing current code context.
- [indent-blankline.nvim](https://github.com/lukas-reineke/indent-blankline.nvim)
  and [nvim-colorizer.lua](https://github.com/NvChad/nvim-colorizer.lua) - small
  visual touches that help when scanning code.

# Wrapping up the terminal walkthrough

That closes the loop on the terminal-based setup: emulator and font, `tmux` for
layout and persistence, AI agents living next to your shell, and `Neovim` as the
IDE that ties it all together. None of the pieces are exotic on their own - what
makes the workflow powerful is how well they compose. Once your hands stop
leaving the keyboard, going back to a mouse-driven IDE feels like a downgrade.
