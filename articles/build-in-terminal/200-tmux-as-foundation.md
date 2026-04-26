---
title: "Foundation: tmux"
excerpt: "Spawn terminals like a boss!"
date: 2026-03-07
---

include plugins like `gitmux`

# One terminal is not enough

When moving to terminal based workflow I was searching for an effective way of
managing multiple applications. For instance it's very common to have IDE
(Neovim) running along some backend logs and separate terminal for
running/stopping application. Having it all on single screen boosts
productivity.

Currently there are lots of terminal emulators that offer such featueres
(Windows Terminal, Warp, Termux, Kitty, Alacritty) but I was looking for
something that will work directly on remote machine. This allows to not get used
to device/os that I use to connect to the machine. No matter if I use pc or
smartphone I can split terminal using the same keyboard shortcuts.

`tmux` ([link](https://github.com/tmux/tmux/wiki)) is the tool of my choice. It
allows to easily spawn new terminal windows whenever I need to run some process,
check logs or do something else. `ctrl+space`, then `v` and my terminal is split
in half with another terminal ready to run some more commands.

`tmux` has one more outstanding feature. It's easy to return to the established
session. If for any reason my tmux session is interrupted (in case of working on
remote machine it may mean dropped connection) one can easily run `tmux attach`
to land exactly in the same place where I left.

![tmux-in-action](./images/tmux-in-action.mp4)

> With `tmux` it's easy to switch to another 'thread' and continue work. One can
> easily split terminal and move to another tool to accomplish given task.

# Tmux plugins

## Managed via plugin manager

In most cases default `tmux` installation won't be enough. To enjoy working with
it one has to introduce some sort of customization. First of all, there are some
`must-have` plugins which I suggest anyone to install. But before installing
plugins we need to install `tmux` plugin manager (unfortunately, AFAIK `tmux`
doesn't have native support for plugins). For this I recommend
[Tmux Plugin Manager](https://github.com/tmux-plugins/tpm). Whole installation
is rather straightforward:

```bash
# Install Tmux
echo "Installing tmux..."
sudo apt-get install tmux -y
if [ ! -d "$HOME/.tmux/plugins/tpm" ]; then
  git clone https://github.com/tmux-plugins/tpm $HOME/.tmux/plugins/tpm
fi
echo "Tmux installed."
```

Two plugins that I use with `tpm` (and recommend) are:

- Extrakto ([link](https://github.com/laktak/extrakto)) - allows to select text
  without using mouse:

![tmux-extrakto](./images/tmux-extrakto.mp4)

> No need to use mouse to copy&paste parts of the text visible on screen

- Tmux Prefix Highlight
  ([link](https://github.com/tmux-plugins/tmux-prefix-highlight)) - Display in
  status bar visual indicator that `tmux` prefix key is pressed

![tmux-prefix-highlight](./images/tmux-prefix-highlight.jpg)

> This small symbol on the lower right corner is an indicator that `tmux` prefix
> key was pressed indicating that `tmux` waits for additional key stroke.

## Gitmux

There is one more plugin which is (IMHO) a `must-have` -
[gitmux](https://gitmux.com/). It displays git status in tmux status line which
allows for quick overview about branch on which I'm currently and amount of
changes. I can't imagine working without it!

# Configuration

As I've mentioned in my case I use highly customized tmux with custom key
bindings. Pre-AI it allowed me to take a quick look at my `tmux.conf` file to
see what key shortcuts are available. I've also removed key shortcuts I don't
use. If you want to take a look at my `env-setup` repository -
[tmux.conf](https://github.com/sobanieca/env-setup/blob/master/tmux.conf). It
contains quite a bit of setup. It should be fairly easy to elaborate on each
setting using AI so I don't see point in explaining everything here. I believe
one can use it just as an inspiration for custom setup that will work well for
you.
