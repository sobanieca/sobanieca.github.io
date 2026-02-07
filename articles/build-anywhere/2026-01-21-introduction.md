---
title: "Remote machine as your development foundation"
excerpt: "You keep upgrading your PC to keep up with software development? What if you could utilize computing power on-demand?"
---

You are viewing this page on a physical device like mobile phone or PC. All
compute power is limited only to the machine that you are using. Did you ever
wish you had more compute power? Maybe during some tasks your machine is
overheating and radiator is working like crazy making lots of noise? Maybe you
want to use mobile phone as a development machine? For more complex tasks and
operations you may need extra compute power.

In this series of articles I plan to present to you possibilities of working on
remote machine. This is something that, at some point of configuring my android
phone was inevitable. In order to work with some specific technologies like
.NET, or running Docker containers, I've had to setup remote virtual machine
where I could connect. I needed x86 architecture and more CPU.

Initially, since I've had access to MS Azure and quite a lot of credits, I've
setup Windows machine and connected there using Remote Desktop. It quickly
turned into nightmare. Streaming GUI is laggy, there were issues with Android
overtaking system buttons (like `Windows` button on keyboard). The more I used
it the more obvious it started to be that I need to try something else.

That's where terminal came into play. I've switched entirely into terminal flow,
which I try to share in `Build in terminal` section. Instead of remote desktop
I've started to use SSH for connections. In this section I will try to provide
some guidelines on how to setup proper remote machine and connect to it using
SSH.
