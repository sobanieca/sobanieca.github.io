---
title: "Termux: foundation for terminal on the go"
excerpt: "If you want to code on the go - Termux is your starting point"
date: 2026-03-12
---

TODO: fine tune article

# Your phone, your terminal

In the previous article I promised that the device in your pocket can be a real
development environment. The first piece of that puzzle is a usable shell. On
Android that means **Termux**.

Termux is a package-managed, Linux-flavored environment that runs on Android
without root. It ships its own `pkg` manager, its own `$PREFIX`, and a set of
binaries that feel close enough to a regular Linux box that most muscle memory
carries over. It is not a full Linux distribution (we'll get to that in the next
article), but as a launchpad it is excellent.

One detail worth flagging up front: you don't have to swap out your usual
keyboard to use it. Termux layers a configurable row of extra keys (Esc, Ctrl,
Tab, arrows) on top of whatever keyboard is already on your phone, so Gboard and
the rest keep working as normal. We'll wire that row up further down.

A quick note on installation: Termux is now available on the Play Store again,
alongside F-Droid and the official GitHub releases. Any of the three is fine.
Older guides still warn against the Play Store version - that warning is out of
date.

# Termux as an entry point

Before installing anything, it's worth being explicit about how I actually use
Termux day to day. I don't treat it as my main workspace. It is an entry point

- I open it to do one of two things:

- Launch a real Debian via `proot-distro` (covered in the next article).
- `ssh` into a remote machine that I've already prepared (covered in the
  `build-anywhere` series).

That framing keeps the install list refreshingly short. After a fresh Termux
install I run:

```bash
pkg upgrade
pkg install proot-distro
pkg install termux-api
```

`proot-distro` is the launcher for the real Linux distribution that lives one
article away. `termux-api` is the bridge that lets the shell talk to Android
itself - more on that at the end of this article. There is no permanent `wget`
or `git` install here on purpose: once I'm inside proot-distro or on the remote
box, those tools live there, not on the Termux side.

# Making the on-screen keyboard tolerable

This is the section that turns Termux from a novelty into something you can
actually live in. A bare Android keyboard is missing every key that matters in a
terminal - no Esc, no Tab, no Ctrl, no arrows. Termux fixes this with a
configurable extra-keys row above the keyboard. Mine looks like this:

```
extra-keys = [ \
 [{ key: 'ESC', popup: 'DEL' }, { key: '`', popup: '~' }, 'SHIFT', 'PGUP', 'UP', 'PGDN'], \
 ['TAB', 'CTRL', 'ALT', { key: 'LEFT', popup: 'HOME' }, 'DOWN', { key: 'RIGHT', popup: 'END' }] \
]
```

Drop that into `~/.termux/termux.properties` and run:

```bash
termux-reload-settings
```

A quick tour of what that buys you:

- `ESC` and `TAB` - non-negotiable for vim and shell completion. Long-press
  `ESC` for `DEL`.
- `CTRL` and `ALT` - the modifier keys that almost every TUI relies on. Tap a
  modifier, then a letter, to chain combos.
- Arrows plus `PGUP`/`PGDN` - cursor movement and scrollback. Long-press the
  horizontal arrows for `HOME`/`END`.
- `` ` ``/`~` - awkward to reach on most software keyboards, but you'll want
  them constantly for shell prompts and home paths.

TODO: screenshot of termux in action

# Visuals: colors and Nerd Font

A proper color palette and a font with full icon coverage make a real
difference, especially on a phone-sized screen. I drop a Tokyo Night palette
into `~/.termux/colors.properties` and install Inconsolata Go (a Nerd Font) at
`~/.termux/font.ttf`:

```bash
mkdir -p ~/.termux
wget https://raw.githubusercontent.com/sobanieca/env-setup/master/colors.properties \
  -O ~/.termux/colors.properties
wget https://github.com/ryanoasis/nerd-fonts/releases/download/v3.0.2/InconsolataGo.zip \
  -O font.zip
unzip font.zip
mv InconsolataGoNerdFontMono-Regular.ttf ~/.termux/font.ttf
termux-reload-settings
```

If you're wondering why a Nerd Font specifically, I covered the rationale in the
[terminal setup](../build-in-terminal/100-terminal-setup.md) article - short
version: status lines, file explorers, and prompt themes all expect those
glyphs.

# The one-shot script

If typing all of the above sounds tedious, it is. I keep the whole flow in my
[env-setup](https://github.com/sobanieca/env-setup) repository and trigger it
with a single line:

```bash
bash -c "$(wget -O - https://raw.githubusercontent.com/sobanieca/env-setup/master/termux.sh)"
```

That covers the package install, both `*.properties` files, and the font in one
go. It's nothing fancy - feel free to fork it and adjust to taste. With AI
agents around, tweaking such a script to your own preferences is almost trivial.

# Termux:API - what you actually get

`termux-api` together with the
[Termux:API companion app](https://wiki.termux.com/wiki/Termux:API) exposes a
chunk of Android to the shell. It's the feature that makes Termux feel less like
an isolated sandbox and more like a first-class citizen on the device.

The capabilities I reach for most:

- **Clipboard sync** - the single biggest quality-of-life win. Pasting between
  Android apps and a terminal session is otherwise painful.

  ```bash
  echo "hello from termux" | termux-clipboard-set
  termux-clipboard-get
  ```

- **Notifications** - useful for letting a long-running task ping you when it's
  done, even when Termux is in the background.

  ```bash
  termux-notification --title "Build done" --content "Tests passed"
  ```

- **Battery status** - handy in scripts that wrap heavy work, so you don't start
  a long compile on 8% battery.

  ```bash
  termux-battery-status
  ```

There's a longer list (location, SMS, camera, TTS, sensors), but those three are
the ones that earn their keep daily.

# What's next

Termux is a great launchpad, but it isn't a full Debian. The moment you reach
for a package that expects glibc, standard paths, or a system service manager,
you'll feel the limit. That's the cue for `proot-distro` - a proper Linux
distribution running on top of Termux. We'll set that up next.
