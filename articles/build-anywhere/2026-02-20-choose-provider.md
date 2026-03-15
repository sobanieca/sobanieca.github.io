---
title: "Choosing the right provider for VPS"
excerpt: "You've decided that you want to move your computing power to the cloud. But which provider to chose from many options?"
---

TODO: Fine tune with AI TODO: Add cover image

So you've decided to use remote machine as your primary workhorse? But where to
start? There are lots of options and I can't list all of them so I will focus
only on those which I've tried/considered.

You can organize selection in two categories:

- Use one of the major cloud providers (AWS, Azure)
- Use smaller VPS providers (Contabo, Hetzner)
- Self host your own server

## Cloud providers

One of the most obvious choices would be to select one of the biggest cloud
providers out there like Azure or AWS. Once you decide to go this way you can be
more relaxed about machine security (by default those machines are hidden behind
decent firewall).

Cloud providers undergo rigorous, recurring audits against industry standards
such as SOC 2 and ISO 27001, ensuring continuous compliance with security,
privacy, and data protection regulations.

I believe this is also quite common that your company already uses Azure or AWS.
There are programs which give employees credits for cloud provider so they can
experiment with it. Some time ago my employer joined such program. I've had
credits for Azure. Enough to afford quite decent Virtual Machine in the cloud.

Possibly, your company already hosts product with such big cloud providers. In
this case it shouldn't be a big deal to ask for 'one more' machine. Assuming we
don't demand some extremely powerful one.

So what are the drawbacks here? I believe it's mostly about price. At the moment
of writing this article, 32 gb RAM machine with 8 vCPU's costs around 60 USD for
~160 hours per month. You can get the same spec machine much cheaper from other
providers like Contabo or Hetzner.

> Note: I've mentioned here specific amount of hours - this is because when you
> use remote machine as your development center you don't need to run it 24h/7.
> In order to save costs you can use it on demand. This greatly lowers costs and
> allows you to use even more powerful machine then you thought!

## Budget VPS providers

If you want to cut costs or for the same amount of many get significantly more
powerful machine I would definitely suggest to take a look at smaller cloud
providers. Great example here is [Contabo](https://www.contabo.com) and
[Hetzner](https://www.hetzner.com).

If such providers offer more for less where is the catch?

- Amount of applications/tools to manage VPS is limited. For instance, I was
  really struggling to utilize Contabo CLI to manage my VPS. Finally I've given
  up. Also UI has come issues.
- Compliance - such smaller providers may lack some compliance certifications
  (although AFAIK Contabo has quite a lot of them)
- Security - you may expect that remote machine from such providers will lack
  additional security. For instance there may be no firewall. Machine is
  accessible from everywhere (unless you configure virtual network but it's
  additional effort). If you run some local dev server that exposes port 3000
  for example, it may be accessible by anyone in the internet. Fear not! You can
  secure it on your own it's just a matter of additional configuration.

## Self host

This is something I didn't try but I've considered it:

- Buy quite powerful machine connect it to internet
- Plug it into smart plug so I can turn it on/off whenever needed.

This may be the cheapest option in the long run, but it involves most effort.

I've decided to not go this way because:

- I don't have corporate ISP - connection may break anytime
- It would be placed in my home, from time to time power outages happen, this
  may be exactly at the moment when I really need to work on something (Murphy's
  law)
- I don't have proper place to put it in my home
- In case of any physical issues (cable disconnected or something) I would have
  to be physically available on site.
- Costs of electricity lower ROI

If you don't feel the same probably it's worth trying. I especially like the
idea of smart plug so it's possible to use 3rd party app to turn on server
whenever it's needed.

## What to choose?

As always - it depends. I would simplify it with following:

> If you want to use remote machine development purely for professional purpose
> for your employer:

Ask your employer to give you access to AWS/Azure machine. You can easily
justify it:

- There is no need to change my physical machine that often. It acts only as a
  thin client for GUI applications. Let's take as an example before mentioned
  AWS machine that costs 60 USD/month. This means it costs 720 USD/year so 2160
  USD/3 years. How much decent laptop with enough compute power costs? More than
  that for sure and in most cases after 3 years it already loses warranty and
  requires replacement.
- Such machine is fully under company's control, if they fire me they can just
  remove the machine and all my access is immediately revoked
- Increased security - if I lose my laptop or it get's stolen most of the
  crucial data is in the cloud anyway.
- As mentioned - your employer may already have access to some benefits in large
  cloud providers that significantly lowers cost of such remote machine

> If you want to use it on your own and don't have access to employers
> infrastructure:

Go with budget VPS providers. It's not that big deal to configure it and they
offer decent computing power for acceptable amount of money. For instance I'm
writing this article on Contabo's VPS with 12 GB RAM and 6 vCPU's and 100GB NVMe
drive for ~5.60 EUR/month. This is really nice price!

> If you're tinkerer and you like to configure hardware on your own AND/OR iF
> you need really lot's of compute power (for instance you want to run some
> powerful LLM's):

In this case most likely it makes sense to setup your own server that runs
somewhere in basement without introducing lots of noise to the place where you
are currently. That way you can work on ultrabook/phone whenever you are in the
world and have access to decent compute power.

In next articles I will present how to configure cloud VPS in some providers.
Please skip these articles if you are no interested in any of these options.
