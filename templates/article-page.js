export function articlePage(article, context, navigation = {}) {
  const category = article.categorySlug;
  const categoryData = context.categories[category];
  const { olderArticle, newerArticle } = navigation;

  const heroImage = article.image
    ? `<div class="article-hero">
        <img src="${article.image.dest}" alt="${article.title}" />
      </div>`
    : "";

  // Older link: points to older article, or category page if this is the oldest
  const olderLink = olderArticle
    ? `<a href="${olderArticle.url}" class="btn btn-secondary">← ${olderArticle.title}</a>`
    : `<a href="/category/${category}.html" class="btn btn-secondary">← Back to ${
      categoryData?.name || category
    }</a>`;

  // Newer link: only show if there's a newer article
  const newerLink = newerArticle
    ? `<a href="${newerArticle.url}" class="btn btn-secondary">${newerArticle.title} →</a>`
    : "";

  return `<article class="article-page">
  <div class="article-top">
    <a href="/category/${category}.html" class="article-category-tag">${
    categoryData?.name || category
  }</a>
  </div>

  <header>
    <h1>${article.title}</h1>
    <div class="article-meta">
      <span>${context.siteAuthor}</span>
      <span>•</span>
      <time datetime="${article.date}">${
    context.formatDate(article.date)
  }</time>
    </div>
  </header>

  ${heroImage}

  <div class="article-content">
    ${article.content}
  </div>

  <div class="article-footer">
    ${olderLink}
    ${newerLink}
  </div>

  <div class="article-comments">
    <h2>Comments</h2>
    <div id="giscus-container"></div>
  </div>
</article>`;
}
