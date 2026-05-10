---
title: "Proot distro - script for installing Linux distribution on your phone!"
excerpt: "If you need more advanced scenarios you can install linux distribution on your phone!"
date: 2026-03-14
---

TODO: fine tune the article, expand some points when suitable

Once you try to use more advanced scripts within Termux described in previous
article (especially the ones that require `sudo`) you may run into issues. This
was clearly visible to me when I've tried to come up with shared script that I
can run on both remote VPS and local Android Termux (for example to setup a new
fresh instance). That's where `proot-distro` really shines. It creates a
(almost) regular Debian instance directly on your phone. I've been using it with
some good results when working on some of my open source projects. What's nice -
this works fully offline (it was possible to code while in train or in some
remote location). What are drawbacks of this setup - it runs directly on phone
CPU. MOdern smartphones are small computers indeed, but let's face it - they
can't replace proper machine. Also, `proot-distro` is still facing some limited
set of permissions (if you don't want to root your phone) so some operations may
not be available. I wasn't also able to run more advanced software like
`Docker`. If you feel like you don't need very advanced tools and you want to
work on some quite simple application, I believe `proot-distro` is good choice.

## Installing Debian via proot-distro

Assumes `proot-distro` is already on Termux (covered in 200's "full Debian path"
install block).

```bash
proot-distro install debian
proot-distro login debian
```

That's it for the install. The next two sections are about making it actually
pleasant to live in.

## The `TERM` quirk that breaks tmux

I use `tmux` quite heavily (as explained in
[tmux](../build-in-terminal/200-tmux-as-foundation.md) article) - and I've found
some issue there\
proot-distro injects `export TERM=xterm-256color` into
`./profile.d/termux-proot.sh`, which fights tmux's own terminfo and produces
broken colors / mangled rendering inside tmux sessions.

Fix: remove that line before launching tmux. Show the file path and the
one-liner.

## What's next

Now once `proot-distro` and regular Debian is installed one can continue do
regular stuff which [Build in terminal](../build-in-terminal) section describes.
