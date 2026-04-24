---
title: "Auto shutdown and setup scripts"
excerpt: "How to lower your bills with auto shutdown? How to quickly setup your next development machine?"
date: 2026-03-06
---

# Scheduled shutdown

If you work with remote machine that is billed hourly and you don't want to end
up with some uncontrolled bill you need to remember about shutting down your
machine whenever you don't use it. Currently, I'm using very simple tool for
it - my server is being shut down every day at 6 pm. There are more fancy
solutions which I may explore some day (shutdown machine after some time if
there are no active SSH sessions). For now let me present this simple approach:

Open root's crontab:

```bash
sudo crontab -e
```

Add the following line:

```
0 18 * * * /sbin/shutdown -h now
```

The machine will power off every day at 18:00 system time. Check the timezone
with `timedatectl` before relying on it - cloud images often ship in UTC, so
`18:00` there may not be `18:00` where you are. If it's off, set it with:

```bash
sudo timedatectl set-timezone Europe/Warsaw
```

That's it. This single line covers the "I forgot to turn it off" case, which is
where most of the actual savings come from.

# Setup scripts

One of the things that also help me a lot to maintain and setup new remote
machine are the setup scripts that I've created. It's nothing
`production ready`. I keep messing around with it, but maybe it will inspire you
to do the same. Take a quick look at
[env-setup](https://github.com/sobanieca/env-setup) repository. There are my
scripts and notes which help me quickly setup a new machine whenever it's
needed. I just configure all users and run:

```bash
bash -c "$(wget -O - https://raw.githubusercontent.com/sobanieca/env-setup/master/env-setup.sh)"
```

After this (and cloning proper git repositories) I'm ready to code almost
immediately. In most cases I need only ~30 minutes to setup new machine
end-to-end to be ready to work.

Nowadays with AI it should be very easy to adjust such scripts to your needs.

# Conclusion

This is more or less all I wanted to share for `build-anywhere` category. It
works very very well for me since couple years and I encourage you to try it as
well. There is some friction when starting but IMHO it pays off later - you have
access to very powerful machines with just a couple of clicks.
