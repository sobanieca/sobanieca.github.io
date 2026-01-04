import { articleCard } from "./article-card.js";

export function categoryPage(category, articles, context) {
  // Default: oldest to newest
  const categoryArticles = articles
    .filter((a) => a.categorySlug === category.slug)
    .sort((a, b) => a.date.localeCompare(b.date));

  const articlesHtml = categoryArticles.length
    ? `<div class="card-grid" id="articles-grid">
      ${categoryArticles.map((article) => `<div class="article-wrapper" data-date="${article.date}">${articleCard(article, context)}</div>`).join("")}
    </div>`
    : `<div class="empty-state">
      <p>No articles in this category yet.</p>
      <p>Check back soon for new content!</p>
    </div>`;

  const sortToggle = categoryArticles.length > 1 ? `
    <button class="sort-toggle" id="sortToggle" title="Change sort order">
      <svg class="sort-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4"/>
      </svg>
      <span id="sortLabel">Oldest</span>
    </button>
  ` : '';

  return `<div class="category-page">
  <header class="category-header">
    <div class="category-header-row">
      <h1>${category.name}</h1>
      ${sortToggle}
    </div>
    <p class="category-description">${category.description}</p>
  </header>
  <section class="articles-grid">
    ${articlesHtml}
  </section>
  ${categoryArticles.length > 1 ? `
  <script>
    (function() {
      const grid = document.getElementById('articles-grid');
      const toggle = document.getElementById('sortToggle');
      const label = document.getElementById('sortLabel');
      if (!toggle || !grid) return;

      let newestFirst = false;

      toggle.addEventListener('click', () => {
        newestFirst = !newestFirst;
        label.textContent = newestFirst ? 'Newest' : 'Oldest';
        toggle.classList.toggle('desc', newestFirst);

        const items = Array.from(grid.children);
        items.sort((a, b) => {
          const dateA = a.dataset.date;
          const dateB = b.dataset.date;
          return newestFirst ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
        });
        items.forEach(item => grid.appendChild(item));
      });
    })();
  </script>
  ` : ''}
</div>`;
}
