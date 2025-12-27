import { postCard } from "./post-card.js";

export function homePage(posts, context) {
  const recentPosts = posts.slice(0, 6);

  return `<div class="home-page">
  <header class="page-header">
    <h1>Latest Posts</h1>
    <p>Exploring software development, tools, and workflows</p>
  </header>
  <div class="card-grid">
    ${recentPosts.map((post) => postCard(post, context)).join("")}
  </div>
</div>`;
}
