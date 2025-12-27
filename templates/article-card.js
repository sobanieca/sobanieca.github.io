export function articleCard(article, { siteAuthor, categories, formatDate }) {
  const category = article.categories[0];
  const categoryData = categories[category];

  const categoryColors = {
    'general': 1,
    'build-anywhere': 2,
    'neovim': 3,
    'build-on-the-go': 4
  };
  const categoryNumber = categoryColors[category] || 1;

  return `<article class="article-card">
  <div class="article-card-header category-${categoryNumber}">
    <span class="article-card-title-bg">${article.title}</span>
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
