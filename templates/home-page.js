import { articleCard } from "./article-card.js";

export function homePage(articles, context) {
  const recentArticles = articles.slice(0, 3);

  return `<div class="home-page">
  <header class="page-header">
    <h1>Recent Articles</h1>
    <p>Latest additions to the collection</p>
  </header>
  <div class="card-grid">
    ${recentArticles.map((article) => articleCard(article, context)).join("")}
  </div>
</div>`;
}
