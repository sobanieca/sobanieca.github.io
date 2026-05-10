---
title: "Debugging frontend on your mobile phone?"
excerpt: "How to debug your frontend javascript code on mobile?"
date: 2026-03-15
---

Before we hand the workflow off entirely to the terminal series, there is one
mobile-specific gap worth flagging - and it's the one I've struggled with most:
debugging frontend code. Honestly, this is IMHO the weakest point of building on
a phone. For years I haven't been able to find the proper tools for it.

The best option I've found was the `Kiwi` browser - it let you open the well
known Chrome DevTools without any fuss. Unfortunately, Kiwi is no longer
maintained. Chrome DevTools themselves aren't really optimized for a phone-sized
screen either, so in practice I could only use them when plugged into an
external display via Samsung DeX.

I've also tried [Eruda](https://github.com/liriliri/eruda) and it looks quite
nice. It's fine for inspecting console logs and poking at the DOM. In the modern
AI era, though, I would prefer to run something like Chrome MCP (or some CLI)
that would let me easily pass debug data to an LLM of choice. So far I haven't
found anything that fits.

Currently I mostly code non-frontend applications, so I've given up on digging
this topic further.

There is one more thing worth noting. If you're on the go and you want to check
how your page would look on a larger desktop screen, there is a hidden option in
Chrome that lets you change the zoom level of desktop mode. I use it quite
frequently:

TODO: show desktop mode zoom screenshot
