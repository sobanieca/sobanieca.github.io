---
title: "The headache of JavaScript runtimes!"
excerpt: "New JS frameworks pop up frequently. Will we see the same for runtimes?"
date: 2026-03-17
---

So you've decided to bet on JavaScript. Now comes the next question: where do
you actually run it?

In the JavaScript ecosystem, the number of frameworks is astonishing, and
picking one for a given task is hard enough on its own. For a long time at least
the runtime question was easy - the browser on the frontend, Node.js on the
backend, and that was it. Then Deno appeared and started a revolution. Later, we
witnessed Bun. From time to time I hear about other attempts at a new JS
runtime, though so far I haven't seen anything else joining the mainstream
(maybe `workerd` from Cloudflare).

It's really easy to get lost here, so I thought I would share my take on this
topic.

## Deno as default choice

I really like Deno. This runtime was a real revolution IMHO. I've been following
the project since version 1.0, and every open source project I write uses Deno
by default.

I have the following reasons to do so:

- The idea of blending frontend and backend code really appeals to me. I love ES
  Modules and the ability to import a JS module from a specific URL without
  having to run `npm install`.
- The built-in security model is impossible to overstate.
- With Deno you get all the tools one could need - linter, formatter. I rarely
  use `TypeScript` in my pet projects, but it's also built-in and configurable.

Having said that, there are a few things I don't like about Deno:

- TypeScript was a foundation of Deno. As a result, there were some performance
  issues in the initial versions (due to type checking files at runtime). It has
  since been moved to a separate command, but I definitely prefer the Node.js
  approach here - support TypeScript by just supporting erasable syntax. When
  using plain JavaScript one can see errors when publishing to JSR, and some
  workarounds with TS compiler settings are needed anyway. This is bad.
- At some point Deno decided to chase a running rabbit - Node.js compatibility.
  This resulted in the Deno team focusing on allowing Deno developers to reuse
  well-known NPM packages. Instead, I would love to see some Deno-native
  libraries, like proper connectors for Postgres, Redis etc. Now it feels like I
  have to use an NPM package anyway each time I want to connect to a Postgres
  database.
- Deno is still relatively unstable. For example, one of my projects, `sqlr`,
  requires an SSL connection to Postgres. It happened a few times during a Deno
  upgrade that it stopped working due to some bugs on the Deno end. I can't
  imagine having such a situation in a production web application used by
  hundreds or thousands of users.
- I'm afraid about the business model of Deno - they offer the Deno Deploy
  platform as a commercial product, but I don't see this platform as a proper
  product for hosting B2B/B2C applications. There is an awesome runtime
  available, there are even databases, but it still lacks many features compared
  to Cloudflare for example (S3-like storage, CDN, email sending service).
  Personally, I would happily use it for some side projects - for example,
  hosting a supporting API that collects metrics or receives webhooks. But to
  host a complete application there, I would have to use some other providers
  anyway. This makes me question whether this business model is viable, and
  whether we'll hear some bad news about Deno one day (hopefully not!).

## Node.js for stability

I won't write anything new here, but Node.js is still a thing in the JS world.
It's mature, stable and supported in many places. If I had to write a B2C/B2B
application, I would most likely choose Node.js.

I don't see Node.js popularity declining in the near future. Actually, it may be
the opposite. Many new projects are some combination of a frontend framework +
Node.js.

## Bun phenomenon

`Bun` is a runtime I never quite understood. It didn't bring any revolution like
Deno did (no ES module imports from URL, AFAIK). It was focused on performance
and adding more tools inside the runtime so everything is in a single place.
From what I hear from time to time, there are some stability issues similar to
what Deno has (let's face it, Bun is the youngest project out of all three
runtimes listed here). Currently I would not consider it for a new project.
Maybe it changes someday.

## Wrap-up

I guess it's impossible to say which runtime is the best one. Choose the right
tool for the job. To summarize - Node.js IMHO is still a valid choice for a
user-facing application. I will keep using Deno for my open source projects
targeted at developers. It's a pleasure to work with, and maybe one day I'll
give it a try in a user-facing application?
