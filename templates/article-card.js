export function articleCard(article, { siteAuthor, categories, formatDate }) {
  const category = article.categories[0];
  const categoryData = categories[category];

  return `<article class="article-card">
  <div class="article-card-image">
    <img src="${article.image || '/assets/images/placeholder.jpg'}" alt="${article.title}" />
  </div>
  <div class="article-card-content">
    <div class="article-card-meta">
      <span class="category-tag">${categoryData?.name || category}</span>
      <span class="read-time">5 min read</span>
    </div>
    <h2 class="article-title">
      <a href="${article.url}">${article.title}</a>
    </h2>
    <p class="article-excerpt">${article.excerpt}</p>
    <a href="${article.url}" class="read-more">Read more →</a>
  </div>
</article>`;
}
