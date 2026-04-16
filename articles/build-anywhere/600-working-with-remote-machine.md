---
title: "Working with remote machine"
excerpt: "Practical hints on your new remote server. How to do software development there?"
date: 2026-03-04
---

So now you have your machine configured and ready to start coding. There are few
things you need to keep in mind when utilizing such remote setup.

# Port forwarding

## Accessing remote services

This is essential. Whenever you run your backend that listens on, let's say,
http://localhost:8000 and you try to reach it from your local machine it won't
be available (and it shouldn't!). In order to access it you need to set port
forwarding the moment when you are connecting to remote machine. Use `-L`
parameter for this. For example for alias defined in previous article:

```bash
ssh -L 8000:localhost:8000 -o TCPKeepAlive=yes -o ServerAliveCountMax=20 -o ServerAliveInterval=15 -q -p {ssh_port} -i ~/.ssh/id_rsa {user}@{IP or DNS}
```

As a result you can access your service as if it would be running directly on
your machine!

> Notice that there is no need to update firewall rules. There is single port
> used (ssh port) which acts as a connection tunnel.

The main drawback here is - you need to know in advance what ports you need when
making connection. Especially when you work on large project this may be an
issue. In my case discipline works - each time when I discover yet another port
I keep updating my connection alias/script. After this I run another parallel
ssh connection. ssh tool is smart enough to extend by just one more port.

There are some situations when on your remote machine you will see very
temporary port open. For instance during MCP authentication in tools like Claude
Code. I didn't give it a try yet, but there is a possibility to extend
established ssh connection with one more port. For now I do the same as
described above - just initiate another ssh connection since I rarely have to do
it.

Believe it or not - with port-forwarding it's possible to run big project with
Vite for frontend and some Node.js backend with orchestrators like
Nomad/Kubernetes completely on remote server.

## Exposing local services to remote

There may be a situation where you have to expose some service on your machine
to the remote machine. For example you may want to expose your chrome with
remote debug so your Claude Code can connect to it with Chrome MCP. In this case
you need to define `-R` parameter:

```bash
ssh -R 9222:localhost:9222 -o TCPKeepAlive=yes -o ServerAliveCountMax=20 -o ServerAliveInterval=15 -q -p {ssh_port} -i ~/.ssh/id_rsa {user}@{IP or DNS}
```

With such connection, whenever you run Claude Code on remote machine, it can
access your local Chrome as if it would work on remote machine.

# Transferring files

There is one more important issue to solve when working on remote machine. How
to transfer files from my local machine to the remote one? It's very common that
we download some assets that we need to include in source code. There are lots
of ways to solve it actually, but in my case I wanted something very simple. I
was looking for a tool that will allow me to navigate to specific directory on
remote server, run single command and as a result file server would be started
for given working directory. I couldn't find anything like this. That's why I've
decided to vibe code my own `remote-file-manager`
([link](https://github.com/sobanieca/remote-file-manager)).

It's not an ultimate solution, but it works very well for me. Let's say I've
downloaded some image that I need to include in my project. I just navigate on
my remote machine to given directory where I want to upload it:

```bash
cd ~/code/my-project/assets
```

And run `rfm` command there. From now I can navigate to
`locahost:8000/file-explorer` to see files within given directory:

TODO: add screenshot of remote file manager

It's possible to edit text files (which is also useful in case when I need to
copy&paste some text content between local - remote machine). This is very basic
application but it completely serves it's purpose for me. Also it has some neat
feature like pasting screenshot directly from clipboard.

What is more - it acts as http server! I can serve html pages easily. So
whenever I navigate to `localhost:8000` it will search for `index.html` file
inside working directory where `rfm` was started.
