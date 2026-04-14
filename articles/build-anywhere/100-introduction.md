---
title: "Remote machine as your development foundation"
excerpt: "Physical devices have real limits. A remote machine lets you decouple your development environment from your hardware."
date: 2026-02-06
---

You are likely reading this on a physical device - a laptop, a tablet, or a
phone. We tend to think of these devices as our "workstations," but they are
fundamentally limited. They have finite battery life, thermal constraints, and a
fixed amount of RAM.

Try running a heavy Docker compose stack or compiling a large .NET project on a
thin-and-light ultrabook. The fans ramp up, the chassis gets hot, and the
battery drains fast.

For heavier workloads, you need more power. But buying a more powerful laptop
only pushes the problem forward.

## The Remote Paradigm

In this series, I want to explore a different approach: **making the remote
machine your primary development foundation.**

For me, this wasn't just an experiment - it was a practical requirement. While
it's technically possible to build hobby apps and pet projects directly on an
Android phone (as covered in the _Build on the Go_ series), professional work
often demands more. I needed specific x86 architectures and heavier workloads
that a mobile processor couldn't handle.

## The GUI Trap

My first attempt was straightforward. I had some Azure credits at the time, so I
spun up a Windows VM in the cloud.

I wanted that familiar desktop experience, but it didn't work well.

Streaming a full graphical interface over the internet is inherently laggy.
Every mouse click feels delayed. On Android, it was worse - the Remote Desktop
app struggled to interpret inputs correctly, and the host OS kept intercepting
system keys (like the `Windows` button) instead of passing them to the VM.

## Embracing the Terminal

Things changed when I stopped trying to stream pixels and started streaming
text.

I dropped the GUI and switched to a **terminal-based workflow**. Instead of
Remote Desktop, I used SSH. The latency was gone. The connection was stable,
even on weak mobile networks.

This is the foundation of the _Build in Terminal_ philosophy. By decoupling the
interface (your lightweight local device) from the compute (the heavy remote
server), you get portability from the local device and compute power from the
server.

In this section, I will guide you through setting up a proper remote development
environment, securing it with SSH, and making it feel just as responsive as
`localhost`.

## Recovery

There is another practical advantage worth mentioning: **quick recovery**.

If your physical laptop is stolen or crashes today, you lose time. You have to
buy a new machine, reinstall your IDEs, clone your repos, and configure your
environment.

When your development environment is remote, your physical device becomes a
disposable "thin client." Drop it in a lake? Lose it on a train? It doesn't
matter. You can grab any cheap laptop, install an SSH client, and be back at
work in minutes - exactly where you left off.
