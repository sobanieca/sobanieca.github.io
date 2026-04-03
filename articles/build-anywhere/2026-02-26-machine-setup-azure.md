---
title: "Setup machine on Microsoft Azure"
excerpt: "You want to setup MS Azure machine but you're not sure where to start? Check here!"
---

> This article describes Microsoft Azure machine configuration. If you don't
> have access to Azure, feel free to move to next article.

- Step-by-step on what to configure. Mostly about configuring security group,
  then add new virtual machine instance

To configure our remote machine on Microsoft Azure we need to start by selecting
the proper type. Similarly to AWS, Azure, offers various machine types depending
on the use case (compute oriented, 'burstable' etc.). In my case I've always
user D-Series machine. Currently one may consider D4 v5 (4 vCPU, 16 GB RAM), but
it all depends on the projects that we plan to work on.

Follow this steps to configure your machine:

- Login to Azure Portal
- Add a new Virtual Machine
- Select quick start, setup ssh keys etc.
- Add non default ssh port (we will remove default one later)
