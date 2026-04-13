---
title: "Connecting and securing your VPS"
excerpt: "You have your machine. Now how do you connect to it? And more importantly, how do you secure that connection?"
date: 2026-03-02
---

TODO: describe firewall settings to limit IP

# First Connection

Before we begin, I assume you already have the following:

- The IP address (or DNS hostname) of your remote machine.
- Your initial credentials—either a username and password, or a `.pem` file
  containing your private key.

There are many SSH clients available, but this guide focuses on the most common
one: the `ssh` command-line tool. It comes pre-installed on macOS, Linux, and
modern versions of Windows. Since my primary environments are Debian (via WSL2
on Windows) and Termux (on Android), some minor details might differ if you use
a different OS.

Let's start with your very first connection.

**If you are using a username and password:**

```bash
ssh {user}@{IP or DNS}
```

**If you are using a private key (PEM) file:**

```bash
ssh -i {path to PEM file} {user}@{IP or DNS}
```

> **Note:** When using a private key file, you must ensure it has strict,
> limited permissions. You can set this on Linux/macOS by running
> `chmod 400 {path to PEM file}`.

> **Tip:** You might receive different private key file types depending on your
> cloud provider (e.g., `.key`). The usage remains exactly the same. If you spun
> up an AWS EC2 instance running Debian, your default `{user}` is usually
> `admin`.

---

# Add a New User

Once connected as `root` (or the default admin user), you need to finalize your
machine's setup. Running your server as `root` is a major security risk.
Instead, you should create a dedicated user for your day-to-day operations.

To create a new user, run:

```bash
adduser {user}
```

Follow the prompts to set a password. Next, you need to give this user the
ability to run commands with elevated privileges. Open the sudoers file by
running `visudo` and add the following entry directly below the `root`
permissions:

```text
{user} ALL=(ALL) NOPASSWD:ALL
```

This configuration allows your new user to run `sudo` commands without being
prompted for a password every time.

---

# Initial SSH Server Configuration

The next step is to lock down your SSH daemon. Run
`sudo nano /etc/ssh/sshd_config` and ensure the following settings are present
and set as shown:

```text
Port {custom port, NOT 22}
PermitRootLogin no
ClientAliveInterval 0
AllowTcpForwarding yes
```

- **`Port`**: Changing the default port won't make your server bulletproof, but
  it drastically cuts down on log noise from automated botnets scanning port 22.
  _Make sure you've opened this new port in your cloud provider's firewall (AWS
  Security Groups, Azure NSG, etc.) before saving! (if you use 'budget' VPS
  providers most likely there is no firewall so no need to adjust anything)_
- **`PermitRootLogin no`**: Now that you have a regular user with `sudo` access,
  there is zero reason to allow `root` to log in directly over SSH.
- **`ClientAliveInterval 0`**: When using a remote server as your primary
  development environment, you want long-lived SSH connections. Setting this to
  `0` disables the server-side timeout.
- **`AllowTcpForwarding yes`**: This allows you to tunnel ports over SSH, which
  is essential for remote development (more on this in the next article).

Save the file and reload the SSH service to apply the changes:

```bash
sudo systemctl reload sshd.service
```

> **Important:** On some servers check the `/etc/ssh/sshd_config.d/` directory.
> Files in this folder can override your main configuration. If you see
> conflicting settings there, edit them as well.

---

# Connect as a Newly Added User

Now connect to the machine with the newly created user. Remember that SSH is no
longer listening on the default port:

```bash
ssh -p {port} {user}@{IP or DNS}
```

You will be asked to type the password that you configured for your user. We
want to get rid of passwords during SSH connections entirely—it's much safer to
use private key files.

Create the `.ssh` directory if it doesn't exist:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

# Generate an SSH Key

Open a new terminal on your **local client machine**—we're going to generate a
key pair there and then upload the public part to your VPS.

On your local machine, run:

```bash
ssh-keygen -t rsa
```

Press **Enter** to accept the default path (`~/.ssh/id_rsa`). You will be
prompted to set an optional passphrase. A passphrase adds an extra layer of
protection in case someone ever gets hold of your private key file. This command
produces two files:

- `~/.ssh/id_rsa` — Your **private** key. Keep it secret, never share it, and
  never copy it anywhere outside of your client machine.
- `~/.ssh/id_rsa.pub` — Your **public** key. This is the one that goes on the
  server.

---

# Upload the Public Key

The cleanest way to get the public key onto the VPS is `ssh-copy-id`. It takes
care of appending the key to `~/.ssh/authorized_keys` on the server and making
sure file permissions are correct:

```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub -p {ssh_port} {user}@{IP or DNS}
```

You'll be asked for your VPS user's password one last time.

---

# Disable Password Authentication

Now connect to your server using the SSH key this time:

```bash
ssh -i ~/.ssh/id_rsa -p {ssh_port} {user}@{IP or DNS}
```

Run `sudo nano /etc/ssh/sshd_config` again and set:

```text
PasswordAuthentication no
ChallengeResponseAuthentication no
```

Save and reload:

```bash
sudo systemctl reload sshd.service
```

> **Important:** On some servers check the `/etc/ssh/sshd_config.d/` directory.
> Files in this folder can override your main configuration. If you see
> conflicting settings there, edit them as well.

That's it! From now on, the only way to SSH into your VPS is with your private
key.

# Setup firewall

Follow this step especially when you are using budget VPS provider which doesn't
offer any built-in firewall. Without it, your VPS is fully exposed to the
external traffic. This means that if you run your project in some development
mode it may be available to anyone (depending to which url it binds). To be on a
safe side you need to set firewall. We will use `ufw` tool for this. Run
following:

```bash
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow {ssh_port}/tcp
sudo ufw enable
sudo ufw status verbose
```

> IMPORTANT! Make sure that you provide exactly the same SSH port that you used
> in previous steps. Otherwise you will lock your server!

There is an additional layer of security which I personally like to apply.
Locking access to the machine to only currently connected IP (via SSH). Below
script is quite harmless because it operates on `iptables` which are reset
together with your server. So even if your connection drops (your ISP has some
outage) and you switch to mobile connection, you can just restart your VPS.

If you like this idea add following to `bashrc`:

```bash
# Lock SSH to current IP (iptables - non-persistent, works alongside ufw)
MY_IP=$(echo "$SSH_CONNECTION" | awk '{print $1}')
if [ -n "$MY_IP" ]; then
    if ! sudo iptables -C INPUT -p tcp --dport {ssh_port} -s "$MY_IP" -j ACCEPT 2>/dev/null; then
        sudo iptables -S INPUT | grep -E "\-\-dport {ssh_port}" | sed 's/^-A/-D/' | while read -r rule; do
            sudo iptables $rule
        done
        sudo iptables -I INPUT 1 -p tcp --dport {ssh_port} -s "$MY_IP" -j ACCEPT
        sudo iptables -I INPUT 2 -p tcp --dport {ssh_port} -j DROP
    fi
fi
```

# Setup alias for SSH connection

That's all! Now you have your machine configured and ready to work on. The last
step is to configure your client machine to properly connect to the server
without having to deal with connection timeouts etc.

It makes sense to add alias for connection in `bashrc` file (adjust values
accordingly):

```bash
echo "alias my-connection='ssh -o TCPKeepAlive=yes -o ServerAliveCountMax=20 -o ServerAliveInterval=15 -q -p {ssh_port} -i ~/.ssh/id_rsa {user}@{IP or DNS}'" >>
~/.bashrc
```

Source `bashrc` with `source ~/.bashrc` and type `my-connection` to make long
lived SSH connection to your new machine! Proceed to next article where I try to
explain how to deal with specifics of remote server during software development.
