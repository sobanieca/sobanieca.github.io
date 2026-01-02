export function articlePage(article, context) {
  const category = article.categories[0];
  const categoryData = context.categories[category];

  const heroImage = article.image
    ? `<div class="article-hero">
        <img src="${article.image.dest}" alt="${article.title}" />
      </div>`
    : '';

  return `<article class="article-page">
  <div class="article-top">
    <a href="/category/${category}.html" class="article-category-tag">${categoryData?.name || category}</a>
  </div>

  <header>
    <h1>${article.title}</h1>
    <div class="article-meta">
      <span>${context.siteAuthor}</span>
      <span>•</span>
      <time datetime="${article.date}">${context.formatDate(article.date)}</time>
    </div>
  </header>

  ${heroImage}

  <div class="article-content">
    ${article.content}
  </div>

  <div class="article-footer">
    <a href="/category/${category}.html" class="btn btn-secondary">
      ← Back to ${categoryData?.name || category}
    </a>
  </div>
</article>`;
}
