export function postCard(post, { siteAuthor, categories, formatDate }) {
  const category = post.categories[0];
  const categoryData = categories[category];

  return `<article class="post-card">
  <div class="post-card-image">
    <img src="${post.image || '/assets/images/placeholder.jpg'}" alt="${post.title}" />
  </div>
  <div class="post-card-content">
    <div class="post-card-meta">
      <span class="category-tag">${categoryData?.name || category}</span>
      <span class="read-time">5 min read</span>
    </div>
    <h2 class="post-title">
      <a href="${post.url}">${post.title}</a>
    </h2>
    <p class="post-excerpt">${post.excerpt}</p>
    <a href="${post.url}" class="read-more">Read more →</a>
  </div>
</article>`;
}
