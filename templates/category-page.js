import { postCard } from "./post-card.js";

export function categoryPage(category, posts, context) {
  const categoryPosts = posts.filter((p) =>
    p.categories.includes(category.slug)
  );

  const postsHtml = categoryPosts.length
    ? `<div class="card-grid">
      ${categoryPosts.map((post) => postCard(post, context)).join("")}
    </div>`
    : `<div class="empty-state">
      <p>No posts in this category yet.</p>
      <p>Check back soon for new content!</p>
    </div>`;

  return `<div class="category-page">
  <header class="category-header">
    <h1>${category.name}</h1>
    <p class="category-description">${category.description}</p>
  </header>
  <section class="posts-grid">
    ${postsHtml}
  </section>
</div>`;
}
