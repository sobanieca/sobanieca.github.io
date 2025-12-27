import { articleCard } from "./article-card.js";

export function homePage(articles, context) {
  const recentArticles = articles.slice(0, 6);

  return `<div class="home-page">
  <header class="page-header">
    <h1>Latest Articles</h1>
    <p>Exploring software development, tools, and workflows</p>
  </header>
  <div class="card-grid">
    ${recentArticles.map((article) => articleCard(article, context)).join("")}
  </div>
</div>`;
}
