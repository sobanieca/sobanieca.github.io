---
title: "sqlr: interact with SQL databases"
excerpt: "Want to query SQL databases directly from the terminal? Don't want to leak your connection strings to an LLM?"
date: 2026-03-23
---

Few years ago (when I worked in .NET tech stack) I was working on a project
where frequently I've had to check something in the database. At that time it
was SQL Azure database. It become quite frustrating for me to open each time SQL
Management Studio, wait for it to load, wait for it to connect to the database
and finally run some SQL. That was the moment when I've decided that I need to
search for a simple to use CLI tool so I can have some scripts which will
automate some of these tasks. I didn't find anything suitable for me. I wanted
to have JSON results and easily manageable list of connections. That's where
I've decided to create [sqlr](https://github.com/sobanieca/sqlr) project.

It allows to define and manage connections from CLI. Then querying database is
as simple as `sqlr query "select * from main.users"`.

Let's see it on example of SQLite database:
