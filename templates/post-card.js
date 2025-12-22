export function postCard(post, { siteAuthor, categories, formatDate }) {
  const category = post.categories[0];
  const categoryData = categories[category];

  return `<article class="post-card">
  <span class="category-tag">${categoryData?.name || category}</span>
  <h2 class="post-title">
    <a href="${post.url}">${post.title}</a>
  </h2>
  <div class="post-meta">
    <span class="author">${siteAuthor}</span>
    <span class="separator">•</span>
    <time datetime="${post.date}">${formatDate(post.date)}</time>
  </div>
  <p class="post-excerpt">${post.excerpt}</p>
  <a href="${post.url}" class="read-more">Read more</a>
</article>`;
}
