---
title: "Setup machine on AWS"
excerpt: "You want to setup AWS machine but you're not sure where to start? Check here!"
---

TODO: fine-tune

> This article describes AWS machine configuration. If you don't have access to
> AWS, feel free to move to next article.

If you want to configure remote machine with AWS, you can go with EC2 service.
Now, the first tricky part is - what machine to choose? There are tons of
options and it's very easy to get lost there. It really depends on the projects
you plan to work on. You can use EC2 pricing calculator to determine what will
be the total cost depending on selected RAM and CPU. EC2 offers various machine
types depending on the specifics of your workloads. For example there are CPU
oriented machines for high CPU usage and machines for 'burst' type of workloads
where they don't need to run at full speed 100% of the time. For programming
purpose I suggest `m8i` or `m8g` machines (or newer generations if they are
available). These are intel (x86 architecture) and graviton (ARM architecture)
based machines with balanced parameters (cpu and memory) that for me seem very
well suited for the specific of software engineering workloads. The only thing
that you need to figure out is how much RAM and CPU do you need. I believe for
most cases machine like `m8i.2xlarge` is more than sufficient (32gb ram, 8 vCPU,
256 gb disk space). Since we will code in terminal RAM won't be occupied by any
GUI which already allows to get even more out of your machine.

Follow these steps to configure your machine:

- Log into AWS console
- Navigate to EC2 and click `Launch instance`
  ![EC2 Launch Instance](./images/aws-step1.png)
- Enter the name for a new instance and select `Debian` as the OS (at least
  that's what I use and recommend)
  ![Name and OS selection](./images/aws-step2.png)
- Scroll down and select instance type. As mentioned above for typical
  development `m` machines should be sufficient. Also generate a new key pair -
  it will be needed to access machine. You will download key file, store it in
  some secure place. ![Instance type and key generate](./images/aws-step3.png)
- Scroll to network settings. Click edit.
  ![Edit network settings](./images/aws-step4.png)
- We can add a custom SSH port here that we will configure later. This is for
  security reasons. One should not use default SSH port for connections. Click
  on `Add security group rule` and add some port that you plan to use instead of
  default one (22). ![Add custom SSH port](./images/aws-step5.png)

> At this point you need to keep the default port. You will remove it after
> first connection and configuration. In upcoming article I will present how to
> configure SSH connection on your server.

- Click `Launch instance` in summary. After a while your server should be ready.
- Now you can navigate to the details of your machine. Note 3 important things
  there - `Public IPv4 address`, `Instance state` and `Security` tab.
  ![Instance details](./images/aws-step6.png)

`Public IPv4 address` will be used to connect to your machine. `Instance state`
can be used to control state of your machine - stop it whenever you don't need
it or start on demand. This helps to greatly save costs! `Security` allows you
to find related security group. You will need to remove there default SSH port
rule later after adjusting SSH connection in server settings. Proceed to next
articles to find out how to configure your server.
