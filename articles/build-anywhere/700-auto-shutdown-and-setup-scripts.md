---
title: "Auto shutdown and setup scripts"
excerpt: "How to lower your bills with auto shutdown? How to quickly setup your next development machine?"
date: 2026-03-06
---

With a working remote setup and a comfortable way to run services and move files
between machines, there are two small habits left that make day-to-day life with
a remote server much easier: not paying for idle compute, and being able to
rebuild the whole setup quickly when you need a new machine.

# Scheduled shutdown

If your remote machine is billed hourly, forgetting to turn it off is the most
common way to end up with an uncontrolled bill. I use a very simple guardrail
for this - my server shuts down every day at 6 pm, which simply matches the end
of my work day and may not suit everyone. There are fancier solutions worth
exploring some day (for example, auto-shutdown after a period of SSH
inactivity), but this basic version already covers where most of the actual
savings come from.

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
sudo dpkg-reconfigure tzdata
```

That's it. This single line covers the "I forgot to turn it off" case, which is
where most of the actual savings come from.

# Setup scripts

The other habit is making it cheap to spin up a fresh machine. Over time I've
collected a small repository of setup scripts that take a new VPS from a blank
Debian image to "ready to code" in a single command. It's nothing production
ready - I keep messing around with it - but maybe it will inspire you to build
your own. Take a quick look at the
[env-setup](https://github.com/sobanieca/env-setup) repository.

Once users are configured, I just run:

```bash
bash -c "$(wget -O - https://raw.githubusercontent.com/sobanieca/env-setup/master/env-setup.sh)"
```

After this (and cloning the relevant git repositories) I'm ready to code almost
immediately. In most cases I need only around 30 minutes to set up a new machine
end-to-end.

Nowadays, with AI, it should be very easy to adjust such scripts to your own
needs.

# Conclusion

That's more or less everything I wanted to share for the `build-anywhere`
category. This workflow has served me very well for a couple of years now, and I
encourage you to give it a try. There is some friction at the start, but in my
opinion it pays off quickly - you end up with access to very powerful machines
just a few clicks away, and a local device that is genuinely disposable.
