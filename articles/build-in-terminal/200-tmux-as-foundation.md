---
title: "Foundation: tmux"
excerpt: "Spawn terminals like a boss!"
date: 2026-03-07
---

TODO: write

include plugins like `gitmux`

When moving to terminal based workflow I was searching for an effective way of
managing multiple applications. For instance it's very common to have IDE
(Neovim) running along some backend logs and separate terminal for
running/stopping application. Having it all on single screen boosts
productivity.

Currently there are lots of terminal emulators that offer such featueres
(Windows Terminal, Warp, TODO: list few more) but I was looking for something
that will work directly on remote machine. This allows to not get user to client
specific and no matter if I use pc or smartphone I can split terminal using the
same keyboard shortcuts.

`tmux` ([link](https://github.com/tmux/tmux/wiki)) allows me to easily spawn new
terminal windows whenever I need to run some process, check logs or do something
else. `ctrl+space`, then `v` and my terminal is split in half with another
terminal ready to run some commands.

`tmux` has one more outstanding feature. It's easy to return to the established
session. If for any reason my tmux session is interrupted (in case of working of
remote machine it may mean dropped connection) one can easily run `tmux attach`
to land exactly in the same place where I left.

![tmux-in-action](./images/tmux-in-action.mp4)

> With `tmux` it's easy to switch to another 'thread' and continue work. One can
> easily split terminal and move to another tool to accomplish given task.

TODO: insert screenshot of tmux in action
