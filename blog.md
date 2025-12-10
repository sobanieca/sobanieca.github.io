---
layout: page
title: Blog
permalink: /blog/
---

# All Posts

Here you'll find all my blog posts about JavaScript, Deno, Serverless, and web development.

<ul>
  {% for post in site.posts %}
    <li>
      <span>{{ post.date | date: "%b %-d, %Y" }}</span>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>
