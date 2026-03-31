---
title: "Setup machine on AWS"
excerpt: "You want to setup AWS machine but you're not sure where to start? Check here!"
---

TODO: write

> This article describes AWS machine configuration. If you don't have access to
> AWS, feel free to move to next article.

TODO: remove points below

- There are lots of machine types on AWS. Compute oriented, memory, disk,
  workload spikes, etc. Which one to choose?
- Step-by-step on what to configure. Mostly about configuring security group,
  then add new ec2 instance

If you want to configure remote machine with AWS, you can go with EC2 service.
Now, the first tricky part is - what machine to choose? There are tons of
options and it's very use to get lost there. It really depends on the projects
you plan to work on. You can use EC2 pricing calculator to determine what will
be the total cost depending on selected RAM and CPU. EC2 offers various machine
types depending on the specifics of your workloads. For example there are CPU
oriented machines for high CPU usage and machines for 'burst' type of workloads
where they don't need to run at full speed 100% of the time. For programming
purpose I suggest `m8i` or `m8g` machines (or newer generations if they are
available). These are intel and graviton based machines with balanced parameters
(cpu and memory) that for me seem very well suited for the specific of software
engineering workloads. The only thing that you need to figure out is how much
RAM and CPU do you need. I believe for most cases machine like `m8i.2xlarge` is
more than sufficient (32gb ram, 8 vCPU, 256 gb disk space). Keep in mind that
(if you follow these recommendations) RAM won't be occupied by any GUI which
already allows to squeeze even more out of your machine.
