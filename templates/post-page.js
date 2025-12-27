export function postPage(post, context) {
  const category = post.categories[0];
  const categoryData = context.categories[category];

  return `<article class="post-page">
  <div class="post-top">
    <a href="/category/${category}.html" class="post-category-tag">${categoryData?.name || category}</a>
  </div>

  <header>
    <h1>${post.title}</h1>
    <div class="post-meta">
      <span>${context.siteAuthor}</span>
      <span>•</span>
      <time datetime="${post.date}">${context.formatDate(post.date)}</time>
    </div>
  </header>

  <div class="post-content">
    ${post.content}
  </div>

  <div class="post-footer">
    <a href="/category/${category}.html" class="btn btn-secondary">
      ← Back to ${categoryData?.name || category}
    </a>
  </div>
</article>`;
}
