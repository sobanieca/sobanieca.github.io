---
title: "tunnelr: expose local ports through a cheap VPS"
excerpt: "Need to show your local app to the world? Build your own tunnel with a VPS that costs less than a pizza per year."
date: 2026-09-26
---

`jsonr` and `sqlr` were born from the same itch: a small CLI tool that does one
thing and doesn't get in the way. This time the itch was about sharing what I'm
working on.

Every now and then I need to expose a port of my local machine to the internet.
Sometimes to show a work-in-progress app to someone, sometimes to receive a
webhook from an external service, sometimes to reach my dev server from a device
that isn't on the same network. There are hosted tunnel services for that, but
they usually come with sign-ups, random URLs that change on every restart, rate
limits, or a paid plan once you need anything more than the basics.

At the same time, VPS providers like [mikr.us](https://mikr.us) offer tiny
servers for less than 10 USD per year. Such a machine has a public IP, so it's a
perfect middleman. The catch? Cheap providers forward only a few ports (mikr.us
gives you two), and setting up SSH reverse tunnels with the right `sshd`
configuration, keeping them alive and restarting them after a reboot is not
something I want to remember every time.

I wanted a tunnel that is **very simple to use** with such a VPS. So I built
[tunnelr](https://github.com/sobanieca/tunnelr).

```
internet  -->  my-vps.example.com:30185  ==tunnel==>  your machine:3000
```

**Why `tunnelr`?**

- **One binary, two roles:** The same `tunnelr` runs as a server on the VPS and
  as a client on your machine.
- **Built for cheap VPS:** It needs just two open ports - one for the control
  connection and one for the exposed service. Exactly what mikr.us gives you.
- **Set up once, survives reboots:** Run the server command as root and it
  installs itself as a `systemd` service.
- **The key never travels over the network:** Every request carries a one-time
  token signed with the key, so a captured token cannot be reused.
- **Saved connections:** Store the VPS address, ports and key file once, then
  just type `tunnelr`.

### Server

Log in to your VPS (Debian is recommended) and install `tunnelr`:

```bash
curl -fsSL sobanieca.github.io/tunnelr/install.sh | bash
```

Check in your provider's panel which ports are open for your VPS. Let's assume
it's `20185` and `30185`. Start the server on the first one:

```bash
sudo tunnelr server -p 20185
```

It prints the address and the key:

```
tunnelr server 0.2.0 - systemd service "tunnelr" installed and started

  Address:   203.0.113.10:20185
  Key:       kD3xW9q1mZ8pR4tY7uH2cV6bN0aS5fGj
  Key file:  /root/.secret/tunnelr-key

Run this command again anytime to see the address and the key.
```

That's it. You have your own tunnel server. If you forget the key, just run the
same command again.

### Your machine

Install `tunnelr` locally with the same command, then save the key printed by
the server in `~/.secret/tunnelr-key`. Now expose your local port `3000` using
the second open port of the VPS:

```bash
tunnelr 203.0.113.10:20185 -p 30185:3000 -a ~/.secret/tunnelr-key
```

Anyone who opens `203.0.113.10:30185` now reaches port `3000` on your machine.
Keep the command running, `Ctrl+C` closes the tunnel.

> `-a` accepts the key itself or a path to a file with it. When you skip it,
> `tunnelr` reads `~/.secret/tunnelr-key`.

Typing the address every time gets old quickly, so save the connection once:

```bash
tunnelr add vps 203.0.113.10:20185 -p 30185:3000 -a ~/.secret/tunnelr-key
```

From now on `tunnelr` alone opens the last used connection. Working on a
different app today? `tunnelr -p 4000` keeps the same VPS port and forwards it
to local port `4000` instead. `tunnelr ls` and `tunnelr rm vps` manage the saved
connections.

### Good to know

- Every port `tunnelr` uses (the control port and each exposed port) has to be
  one that the VPS really has open. Two open ports mean one tunnel.
- `tunnelr` does not encrypt the traffic. Use HTTPS or SSH inside the tunnel
  when the data is sensitive.
- `tunnelr --help` lists all options, including an HTTP API to list and close
  open ports.

### Conclusion

`tunnelr` doesn't try to compete with full-blown tunneling platforms. It's meant
for the case where you have a cheap VPS at hand and want to expose a local port
in seconds, without sign-ups and without remembering `sshd` flags.

[https://github.com/sobanieca/tunnelr](https://github.com/sobanieca/tunnelr)
