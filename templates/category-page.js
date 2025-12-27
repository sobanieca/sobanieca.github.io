import { articleCard } from "./article-card.js";

export function categoryPage(category, articles, context) {
  const categoryArticles = articles
    .filter((a) => a.categories.includes(category.slug))
    .reverse();

  const articlesHtml = categoryArticles.length
    ? `<div class="card-grid">
      ${categoryArticles.map((article) => articleCard(article, context)).join("")}
    </div>`
    : `<div class="empty-state">
      <p>No articles in this category yet.</p>
      <p>Check back soon for new content!</p>
    </div>`;

  return `<div class="category-page">
  <header class="category-header">
    <h1>${category.name}</h1>
    <p class="category-description">${category.description}</p>
  </header>
  <section class="articles-grid">
    ${articlesHtml}
  </section>
</div>`;
}
