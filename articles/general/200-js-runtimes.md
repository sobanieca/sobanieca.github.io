---
title: "Headache of Javascript runtimes!"
excerpt: "New JS frameworks pop up frequently. Will we see the same for runtimes?"
date: 2026-03-17
---

In Javascript ecosystem amount of frameworks is astonishing. It's really hard to
figure out what's the best one for given task. This was never the case for
runtimes - we've had web browsers runtime on frontend and node.js on backend.
For many years there was no choice. Then... Deno appeared and started
revolution. Later we've witnessed Bun.

From time to time I hear about another attempts for new JS runtime. So far I
didn't hear about anything else joining main stream (maybe `workerd` from
Cloudflare)

It's really easy to get lost here so I thought I will share my take on this
topic.

## Deno as default choice

I really like Deno. This runtime was a real revolution IMHO. I'm following the
project since version 1.0 and every open source project I write, by default uses
Deno.

I have following reasons to do so:

- The idea of blending frontend and backend code really buys me. I love ES
  Modules and possibility of just importing JS module from specific url without
  having to run `npm install`.
- Security built-in is impossible to "over-appreciate".
- With Deno you get all tools one can need - linter, formatter. I rarely use
  `Typescript` in my pet projects, but it's also built-in and configurable.

Having said that there are few things I don't like about Deno:

- Typescript was a foundation for Deno. As a result there were some performance
  issues at the initial version (due to typechecking files in runtime). Now it's
  moved away to separate command, but I definitely prefer Node.js approach
  here - support typescript by just supporting syntax that is erasable.
- At some point Deno decided to catch running rabbit - Node.js compatibility.
  This resulted in Deno team being focused on allowing Deno developers to re-use
  well known NPM packages. I would love instead to see some Deno native
  libraries like proper connectors to Postgres, Redis etc. Now I feel like I
  will have to use NPM package anyway each time when I want to connect to
  Postgres database.
- Deno is still relatively unstable. For example, one of my projects `sqlr`
  requires SSL connection to Postgres. It happened few times during Deno upgrade
  that it stopped working due to some bugs on Deno end. I can't imagine having
  such situation in a production web application used by hundreds/thousands of
  users)
- I'm affraid about business model of Deno - they offer Deno Deploy platform as
  a commercial product, but I don't see this platform as a proper product for
  hosting B2B/B2C applications. There is awesome runtime available, there are
  even databases, but it still lacks many features compared to Cloudflare for
  example (S3 like storage, CDN, Email sending service). Personally I would
  happily use it for some side projects. For example hosting some supporting API
  that collects metrics, or receives webhooks. But to host there complete
  application I would have to use some other providers anyway. This makes me
  question if this business model is viable and we won't hear some bad news
  about Deno some day (hopefully not!)

## Node.js for stability

I won't write anything new here, but Node.js is still a thing in JS world. It's
mature, stable and supported in many places. If I would have to write a B2C/B2B
application I would most likely choose Node.js.

Not much to add here. I don't see Node.js popularity declining in nearest
future. Actually it may be opposite. Many new projects are some combination of
some frontend framework + Node.js.

## Bun phenomenon

`Bun` is a runtime which I never understood. It didn't introduce any revolution
like Deno (no ES modules import from url AFAIK). It was focused on performance
and adding more tools inside runtime so everything is at single place. From what
I hear from time to time there are some stability issues similar to what Deno
has (let's face it, Bun is the youngest project out of all three runtimes listed
here). I don't see a value in using it and I would not consider it for any of my
future projects.

## Wrap-up

I guess it's impossible to say which runtime is the best one. Chose the right
tool for the job. I would summarize that Node.js IMHO is still valid choice for
a user facing application. I will still keep using Deno for my open source
projects targeted for developers. It's a pleasure to work with and maybe some
day I give it a try at some user facing application?
