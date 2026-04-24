export function articlePage(article, context, navigation = {}) {
  const category = article.categorySlug;
  const categoryData = context.categories[category];
  const {
    olderArticle: prevArticle,
    newerArticle: nextArticle,
    nextCategory,
  } = navigation;

  const heroImage = article.image
    ? `<div class="article-hero">
        <img src="${article.image.dest}" alt="${article.title}" />
      </div>`
    : "";

  // Previous link: points to previous article (lower order), or category page if first
  const prevLink = prevArticle
    ? `<a href="${prevArticle.url}" class="btn btn-secondary">← ${prevArticle.title}</a>`
    : `<a href="/category/${category}.html" class="btn btn-secondary">← Back to ${
      categoryData?.name || category
    }</a>`;

  const nextLink = nextArticle
    ? `<a href="${nextArticle.url}" class="btn btn-secondary">${nextArticle.title} →</a>`
    : nextCategory
    ? `<a href="/category/${nextCategory.slug}.html" class="btn btn-secondary">${nextCategory.name} →</a>`
    : "";

  // Top navigation: minimal prev/next links
  const topPrevLink = prevArticle
    ? `<a href="${prevArticle.url}" class="article-top-nav-link">← ${prevArticle.title}</a>`
    : `<a href="/category/${category}.html" class="article-top-nav-link">← Back to ${
      categoryData?.name || category
    }</a>`;
  const topNextLink = nextArticle
    ? `<a href="${nextArticle.url}" class="article-top-nav-link">${nextArticle.title} →</a>`
    : nextCategory
    ? `<a href="/category/${nextCategory.slug}.html" class="article-top-nav-link">${nextCategory.name} →</a>`
    : "";
  const topNav =
    `<nav class="article-top-nav">${topPrevLink}${topNextLink}</nav>`;

  return `<article class="article-page">
  <div class="article-top">
    <a href="/category/${category}.html" class="article-category-tag">${
    categoryData?.name || category
  }</a>
  </div>
  ${topNav}

  <header>
    <h1>${article.title}</h1>
    <div class="article-meta">
      Updated at: <time datetime="${article.date}">${
    context.formatDate(article.date)
  }</time>
    </div>
  </header>

  ${heroImage}

  <div class="article-content">
    ${article.content}
  </div>

  <div class="article-footer">
    ${prevLink}
    ${nextLink}
  </div>

  <div class="article-comments">
    <h2>Comments</h2>
    <div id="giscus-container"></div>
  </div>
</article>`;
}
