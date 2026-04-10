---
title: "Connecting and securing your VPS"
excerpt: "You have your machine. Now how to connect to it? How to secure your connection?"
date: 2026-03-02
---

TODO: write and fine-tune

I assume you already have following:

- IP address (or DNS) of your remote machine
- Credentials for it - username/password or PEM file with private key.

How to connect to your new machine? There are lots of SSH clients out there. I
will focus on the most common one - `ssh` tool. It's installed on most OS
nowadays, but since I use it on Debian (via WSL2 on Windows) or Termux (on
Android) some details may differ if you use it on other OS.

Let's start with very first connection:

For username/password credentials:

```
ssh {user}@{IP or DNS}
```

You will be asked for password.

For PEM file:

```
ssh -i {path to PEM file} {user}@{IP or DNS}
```

When using private key file you need to ensure that it has limited permissions
set. You can ensure that it's fine by running `chmod 400 {path to PEM file}`.

> There are other private key file types out there. For some providers you may
> get for example `.key` file. It shouldn't differ much in usage though.

> If you've configured AWS EC2 instance and selected Debian OS you need to use
> `admin` as `{user}`.
