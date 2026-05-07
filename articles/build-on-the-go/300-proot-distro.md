---
title: "Proot distro - script for installing Linux distribution on your phone!"
excerpt: "If you need more advanced scenarios you can install linux distribution on your phone!"
date: 2026-03-14
---

TODO: write from this plan

## 1. Pickup from article 200

Article 200 closed on: Termux is a great launchpad, but it isn't a full Debian.
This article picks up there. The fix is `proot-distro` — a userland that gives
you a real Debian rootfs on the phone. Same `apt`, same paths, same muscle
memory.

## 2. Heads-up: I moved off this path (but it earned its keep)

Honest disclaimer up front, before the reader invests in the setup:

- I switched away from proot-distro in favor of ssh-into-a-remote (covered in
  the `build-anywhere` series).
- Trigger: one of my open source projects started requiring Docker. Docker
  doesn't run inside proot-distro on Android — no kernel-level
  cgroups/namespaces from a non-root userland.
- **Why I'm still keeping this article**: proot-distro has one killer property
  that ssh can't match — it works **fully offline**. I got real work done on
  trains with no signal, in remote spots with flaky reception, on flights. As
  long as you don't need Docker (or some other not supported tools), it's a
  complete development environment that fits in your pocket and asks nothing of
  the network.

## 3. Installing Debian via proot-distro

Assumes `proot-distro` is already on Termux (covered in 200's "full Debian path"
install block).

```bash
proot-distro install debian
proot-distro login debian
```

That's it for the install. The next two sections are about making it actually
pleasant to live in.

## 4. The `TERM` quirk that breaks tmux

Concrete gotcha. proot-distro injects `export TERM=xterm-256color` into
`./profile.d/termux-proot.sh`, which fights tmux's own terminfo and produces
broken colors / mangled rendering inside tmux sessions.

Fix: remove that line before launching tmux. Show the file path and the
one-liner.

## 5. Provisioning the distro with `env-setup.sh`

Once inside Debian, run the same one-shot script the desktop/SSH path uses:

```bash
bash -c "$(wget -O - https://raw.githubusercontent.com/sobanieca/env-setup/master/env-setup.sh)"
```

What it gives you and why it matters on a phone:

- **tmux + tpm + gitmux** — session persistence is critical when Android may
  pause the app at any moment.
- **neovim + ripgrep + fzf** — the editor stack from the `build-in-terminal`
  series. Cross-link.
- **Node.js + Deno** — run dev servers and tools locally on the phone, no
  network needed.
- **GitHub CLI, lsd, jq** — daily-driver CLI ergonomics.
- **Docker — will install, won't run.** This is the wall I hit. Cross-link back
  to section 2.

## 6. Living inside the distro day to day

Short practical notes:

- Re-entering: `proot-distro login debian` from Termux on each session.
- Storage lives in Termux's `$PREFIX/var/lib/proot-distro/...` — survives Termux
  restarts, wiped if you uninstall Termux. Push your dotfiles to git so
  reprovisioning is one command.

## 7. What's next

Bridge to `400-frontend-debug.md`: with Node/Deno running locally inside Debian,
you can serve a frontend straight from the phone — but actually debugging it
(DevTools on a phone screen) is its own problem. That's the next article.
