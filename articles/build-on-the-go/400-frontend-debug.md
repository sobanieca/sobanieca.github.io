---
title: "Debugging frontend on your mobile phone?"
excerpt: "How to debug your frontend javascript code on mobile?"
date: 2026-03-15
---

There is one more topic that has to be covered when talking about building
software on mobile phone - how to debug frontend effectively. To be honest this
is IMHO the weakest point here. Since many years I can't find the proper tools
for it.The best option I've found was `Kiwi` browser - it allowed to open well
known Chrome dev tools without issues. Unfortunately this browser is no longer
supported. Also, Chrome devtools are not so optimized to view on mobile screens
so I could use it only when connecting to external screen with Samsung Dex.

I've also tried Eruda (todo: add link to project) and it looks quite nice. It's
fine for investigating console logs etc. In modern, AI era though I would prefer
to run something like Chrome MCP (or some CLI) that would allow me to easily
pass debug data to LLM of choice. So far I didn't find anything meaningful.

Currently I mostly code non frontend applications so I have given up on digging
this topic further.

There is one more thing worth noting. If you are on the go and you want to check
how your page may look on larger screen on desktop machine, there is a hidden
option in Chrome that allows to change zoom of desktop mode. I use it quite
frequently:

TODO: show desktop mode zoom screenshot
