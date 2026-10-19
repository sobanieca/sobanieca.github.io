---
title: "todoer: todos and pull requests for AI agents, in git"
excerpt: "One agent builds the feature, another one reviews it with fresh context. All of it local, without waiting for GitHub."
date: 2026-10-19
---

`jsonr`, `sqlr` and `tunnelr` are tools I use while writing code. Nowadays a lot
of that code is written by AI agents, and I noticed that the tools for tracking
the work didn't match the way I work with them.

My flow looks like this. One agent works on a feature from start to finish. Then
I let it sink in for a while. Then another agent, with fresh context, reviews
the changes. The second agent doesn't share the assumptions or the blind spots
of the first one, so it catches things that the first agent took for granted.

Issue trackers and pull requests on GitHub support this flow, but they live on a
remote service. Every step is a round trip to the network, and GitHub hasn't
been the most stable service recently. I wanted the speed of local development:
todos and reviews right next to the code, available even when the network is
not. So I built [todoer](https://sobanieca.github.io/todoer/).

**Why `todoer`?**

- **Plain files in git:** A todo is `.todoer/todos/<name>.md`, a pull request is
  a patch in `.todoer/prs/`. They're versioned with the code they change.
- **Built for agents:** Agents claim todos, work in git worktrees and submit
  pull requests. `todoer ls` shows who works on what.
- **Review in the terminal:** Comment on a line, a range of lines, a file or the
  whole pull request. Another agent can explain the patch or do the comments.
- **One commit per pull request:** A submit squashes the work into one commit,
  so anyone can apply it, change it and update it.
- **No server, no account, no settings:** It's one binary.

### Install

```bash
curl -fsSL sobanieca.github.io/todoer/install.sh | bash
```

Then go to your project and write the todoer skill for Claude Code, Codex and
Cursor:

```bash
cd ~/code/my-project
todoer skill --init
```

From now on agents know the todoer workflow, so you can mostly talk to them in
plain words.

### Plan the work

Add a todo and commit it:

```bash
todoer add fix-login -l auth "Login fails on empty password"
git add .todoer && git commit -m "Plan the auth work"
```

`todoer ls` lists the todos:

```
available    fix-login
```

### First agent: implement

Ask an agent to claim `fix-login` and implement it. It runs
`todoer claim fix-login`, which sets you as the assignee and commits the todo on
your branch. Then it implements the change in a git worktree and submits it:

```bash
todoer pr submit --branch main -n fix-login --todo fix-login
```

The pull request is one commit with all the work, committed on your branch next
to the code it changes.

### Second agent: review

This is the moment to let the change sink in. When you come back, open a new
session, so the reviewer starts with fresh context, and ask it to review the
`fix-login` pull request. It explains the patch and adds the comments with
`todoer pr comment`. You can also go through the patch yourself with
`todoer pr review fix-login`.

Then ask an agent to do the comments. It restores the commit in a new worktree,
makes the changes and updates the pull request with
`todoer pr submit --branch main -n fix-login --update`.

### Merge

When you're happy with the change, merge it:

```bash
todoer pr merge fix-login
```

There is no approve step - a merge accepts the pull request. The same commit
removes the pull request and its todo, so the history stays clean.

### Good to know

- todoer works on any branch and never pushes. Push when you want other people
  to see your claims and pull requests.
- In a folder of projects, such as `~/code`, `todoer ls` lists the todos of
  every project.
- Labels show the progress of a feature with many todos, and todos can depend on
  each other.
- todoer is not released yet. Until version `1.0.0`, any part of it can change.

### Conclusion

`todoer` doesn't try to replace GitHub. It's meant for the loop of one agent
building and another agent reviewing, kept local and fast, next to the code.

[https://github.com/sobanieca/todoer](https://github.com/sobanieca/todoer)
