---
title: "Proot distro - script for installing Linux distribution on your phone!"
excerpt: "If you need more advanced scenarios you can install linux distribution on your phone!"
date: 2026-03-14
---

Termux gets you a usable shell, but the moment a script reaches for `sudo` or
expects standard system paths, you hit the ceiling. I ran into this myself when
I tried to write a single bootstrap script that I could use both on a fresh VPS
and on Termux locally - most of the steps simply didn't translate.

That's where [`proot-distro`](https://github.com/termux/proot-distro) shines. It
installs an (almost) regular Debian directly on your phone, and I've been using
it with good results on a few of my open source projects. The nice part is that
it works fully offline - perfect for coding on a train or in some remote
location.

The trade-offs are honest ones:

- It runs on your phone's CPU. Modern smartphones are small computers, but they
  still can't replace a proper machine.
- Without rooting your phone, `proot-distro` is constrained by the same Android
  permission model, so some operations simply aren't available.
- I haven't been able to run more advanced tooling like `Docker` inside it.

If your work fits within those limits - `proot-distro` is a good choice.

## Installing Debian via proot-distro

This assumes `proot-distro` is already installed in Termux (covered in the
previous article under the "full Debian path" install block):

```bash
proot-distro install debian
proot-distro login debian
```

## The `TERM` quirk that breaks tmux

I use `tmux` heavily (as explained in the
[tmux](../build-in-terminal/200-tmux-as-foundation.md) article), and
`proot-distro` ships a setup that fights with it.

On login, it sources `/etc/profile.d/termux-proot.sh`, which exports
`TERM=xterm-256color`. That overrides whatever `tmux` negotiates for itself and
results in broken colors and mangled rendering inside `tmux` sessions.

The fix is to drop that line before launching `tmux`:

```bash
sed -i '/export TERM=/d' /etc/profile.d/termux-proot.sh
```

After re-logging into the distro, `tmux` behaves again.

## What's next

With `proot-distro` and Debian in place, the rest of the setup is just a regular
terminal workflow. From here you can pick up the
[Build in terminal](../build-in-terminal) series and follow it the same way you
would on any Linux box.
