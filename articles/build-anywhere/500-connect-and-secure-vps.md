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

# Initial SSH server configuration

The next step is to perform initial SSH configuration. Run
`sudo nano /etc/ssh/sshd_config` and make sure the following settings are
present and set as shown below:

```
Port {custom port, NOT 22}
PermitRootLogin no
ClientAliveInterval 0
AllowTcpForwarding yes
```

- `Port` - changing the default port won't make your server bulletproof, but it
  cuts down the noise from automated scanners hammering port 22.
- `PermitRootLogin no` - now that you have a regular user with sudo access,
  there is no reason to let `root` log in over SSH directly.
- `ClientAliveInterval 0` - when using a remote machine as your primary
  development machine you want long lived SSH connections. Most servers are not
  configured this way by default, so setting it to `0` disables the server-side
  timeout.
- `AllowTcpForwarding yes` - this lets you tunnel ports over SSH, which is
  essential if you want to use your server for development (more on this in next
  article).

Save the file and reload SSH:

```
sudo systemctl reload sshd.service
```

> On some servers you should check in `/etc/ssh/sshd_config.d` directory if
> there are any files overriding configuration. If yes you may have to edit them
> as well.

# Connect as a newly added user

Now connect to the machine with the newly created user. Remember that SSH is no
longer listening on the default port:

```
ssh -p {port} {user}@{IP or DNS}
```

You will be asked to type the password that you've configured for your user. We
want to get rid of passwords during SSH connections entirely - it's much safer
to use private key files.

Create the `.ssh` directory if it doesn't exist:

```
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Append your public key (the contents of `~/.ssh/id_*.pub` from your client
machine) to `~/.ssh/authorized_keys` on the VPS.

# Disable password authentication

Run `sudo nano /etc/ssh/sshd_config` again and set:

```
PasswordAuthentication no
ChallengeResponseAuthentication no
```

Save and reload:

```
sudo systemctl reload sshd.service
```

> On some servers you should check in `/etc/ssh/sshd_config.d` directory if
> there are any files overriding configuration. If yes you may have to edit them
> as well.

From now on the only way to SSH into your VPS is with your private key.
