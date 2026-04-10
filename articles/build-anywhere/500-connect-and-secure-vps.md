---
title: "Connecting and securing your VPS"
excerpt: "You have your machine. Now how to connect to it? How to secure your connection?"
date: 2026-03-02
---

TODO: write and fine-tune

# First connection

I assume you already have following:

- IP address (or DNS) of your remote machine
- Credentials for it - username/password or PEM file with private key.

How to connect to your new machine? There are lots of SSH clients out there. I
will focus on the most common one - `ssh` tool. It's installed on most OS
nowadays. Since I use it on Debian (via WSL2 on Windows) or Termux (on Android)
some details may differ if you use it on other OS.

Let's start with very first connection:

For username/password credentials:

```bash
ssh {user}@{IP or DNS}
```

For PEM file:

```bash
ssh -i {path to PEM file} {user}@{IP or DNS}
```

> When using private key file you need to ensure that it has limited permissions
> set. You can do it by running `chmod 400 {path to PEM file}`.

> There are other private key file types out there. For some providers you may
> get for example `.key` file. It shouldn't differ much in usage though.

> If you've configured AWS EC2 instance and selected Debian OS you need to use
> `admin` as `{user}`.

# Add a new user

Now when you've connected as a `root` user you need to finalize setup of your
machine. In most cases you don't want to use your machine as a `root` or `admin`
user. For this reason it makes sense to create a new user specifically for you.
To do this run:

```bash
adduser {user}
```

You need to give this user option to run commands with elevated privileges. For
this reason you need to run `visudo` and add following entry below `root`
permissions:

```
{user} ALL=(ALL) NOPASSWD:ALL
```

This will allow this user to run `sudo` command without being asked for password
each time.

# Adjust SSH Timeouts

When using remote machine as your primary development machine you need to take
into account that majority of the servers are not configured in a way that
supports long lived SSH connections. For this reason you need to check for
`ClientAliveInterval` setting. Run `sudo nano /etc/ssh/sshd_config` and search
for it. If found set it to `0`. Then save the file and either restart server or
run `sudo systemctl reload sshd.service`
