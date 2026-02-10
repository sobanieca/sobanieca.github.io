---
title: "How to tame terminal and build using (mostly) keyboard"
excerpt: "Have you ever envy hackers in movies when they did awesome things using terminal?"
---

I've had 3 good reasons to move to building things inside terminal:

- When I started to think more about possibilities of coding using my mobile
  phone it become clear that GUI environment won't be feasible. On small screen
  one wants to maximize usage of limited space. SSH to remote server will work
  much better than Streaming GUI environment using Remote Desktop. Also, due to
  limited resources using terminal is more beneficial.

- I was fascinated about enormous potential for automation of various tasks.
  Things that I had to manually click on some GUI components could become easily
  some bash scripts. This could greatly speed up my work. With the rise of AI
  era I would say this became even more powerful!

- Very limited need to touch mouse. This physical aspect that improves
  productivity. I don't know how to explain it, but being inside terminal
  without having to move your hands away from keyboard increases focus and makes
  work more smooth.

If any of this reasons sound reasonable to you and you still didn't try to move
your workflow entirely to terminal I suggest you to keep reading and give it a
try!

But where do we start? First, we need to start with terminal emulator. Depending
on your OS you need to install proper application. I'm Windows/Android user so
in my case it's Windows Terminal and Termux respectively. There are many good
terminal emulators for MacOS/iOS as well.

Once you have terminal emulator there is one thing that is crucial to be
installed. Nerd Fonts (https://www.nerdfonts.com)[https://www.nerdfonts.com]
allow you to display not only text but also icons that greatly improve
experience when working in terminal.

![Nerd Font example](./images/nerdfonts.jpg)

> Example of Nerd font - notice nice icons that fit in single character place

For Windows Terminal you need to install selected Nerd Font in your OS and then in terminal settings select proper font.

For Termux, you need to create `~/.termux/font.ttf` file. For example:

```bash
wget https://github.com/ryanoasis/nerd-fonts/releases/download/v3.0.2/InconsolataGo.zip -O font.zip
unzip font.zip
mv InconsolataGoNerdFontMono-Regular.ttf ~/.termux/font.ttf
```

In my case I use (Inconsolata Go)[https://www.programmingfonts.org/#inconsolata-go] and I recommend it.
