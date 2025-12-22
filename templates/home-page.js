import { postCard } from "./post-card.js";

export function homePage(posts, context) {
  const [featuredPost, ...recentPosts] = posts;

  const heroHtml = featuredPost
    ? `<section class="hero-post">
    <span class="category-tag">${context.categories[featuredPost.categories[0]]?.name}</span>
    <h1 class="hero-title">${featuredPost.title}</h1>
    <p class="hero-excerpt">${featuredPost.excerpt}</p>
    <div class="hero-meta">
      <span class="author">${context.siteAuthor}</span>
      <span>•</span>
      <time datetime="${featuredPost.date}">${context.formatDate(featuredPost.date)}</time>
    </div>
    <a href="${featuredPost.url}" class="hero-cta">Read Article</a>
  </section>`
    : "";

  const recentHtml = recentPosts.length
    ? `<section class="posts-grid">
    <h2>Recent Posts</h2>
    <div class="card-grid">
      ${recentPosts.slice(0, 6).map((post) => postCard(post, context)).join("")}
    </div>
  </section>`
    : "";

  return `<div class="home-page">
  ${heroHtml}
  ${recentHtml}
</div>`;
}
