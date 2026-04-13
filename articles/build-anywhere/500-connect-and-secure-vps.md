---
title: "Connecting and securing your VPS"
excerpt: "You have your machine. Now how do you connect to it? And more importantly, how do you secure that connection?"
date: 2026-03-02
---

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

From now on, the only way to SSH into your VPS is with your private key.

# Set Up a Firewall

This step is especially crucial if you are using a budget VPS provider that
lacks a built-in cloud firewall. Without one, your VPS is fully exposed to
external traffic. If you run a project in development mode, it might become
accessible to the public depending on the IP and port it binds to.

To stay on the safe side, we will set up a firewall using the `ufw`
(Uncomplicated Firewall) tool. Run the following commands:

```bash
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow {ssh_port}/tcp
sudo ufw enable
sudo ufw status verbose
```

> **Important:** Make sure you provide the exact SSH port you configured in the
> previous steps. If you don't, you will lock yourself out of your server!

As an additional layer of security, I personally like to restrict SSH access so
only the currently connected IP can log in.

The script below is quite safe because it operates using `iptables` rules, which
are non-persistent. This means they reset whenever your server reboots. If your
connection drops (e.g., an ISP outage) and you need to connect from a mobile
hotspot or a new IP, you can simply reboot your VPS via your hosting provider's
control panel to clear the lock.

If you like this idea, append the following snippet to your remote user's
`~/.bashrc`:

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

---

# Set Up an SSH Connection Alias

That's it! Your machine is now securely configured and ready for work. The final
step is to configure your local client machine so you can connect effortlessly
without dealing with idle connection timeouts.

It makes sense to create a dedicated alias for this connection in your local
`~/.bashrc` file. Be sure to adjust the placeholder values to match your setup:

```bash
echo "alias my-connection='ssh -o TCPKeepAlive=yes -o ServerAliveCountMax=20 -o ServerAliveInterval=15 -q -p {ssh_port} -i ~/.ssh/id_rsa {user}@{IP or DNS}'" >> ~/.bashrc
```

Apply the changes by running `source ~/.bashrc`. From now on, you can just type
`my-connection` to establish a stable, long-lived SSH session to your new
machine!

Proceed to the next article, where we will cover how to navigate the specifics
of using a remote server environment during software development.
