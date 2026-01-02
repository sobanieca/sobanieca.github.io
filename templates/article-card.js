export function articleCard(article, { siteAuthor, categories, formatDate }) {
  const category = article.categorySlug;
  const categoryData = categories[category];

  const categoryColors = {
    'general': 1,
    'build-anywhere': 2,
    'neovim': 3,
    'build-on-the-go': 4
  };
  const categoryNumber = categoryColors[category] || 1;

  const headerStyle = article.image
    ? `background-image: url('${article.image.dest}'); background-size: cover; background-position: center;`
    : '';

  const titleBg = article.image ? '' : `<span class="article-card-title-bg">${article.title}</span>`;

  return `<article class="article-card">
  <div class="article-card-header category-${categoryNumber}" style="${headerStyle}">
    ${titleBg}
  </div>
  <div class="article-card-content">
    <div class="article-card-meta">
      <a href="/category/${categoryData?.slug || category}.html" class="category-tag">${categoryData?.name || category}</a>
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
