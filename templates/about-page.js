export function aboutPage(content, { siteAuthor }) {
  return `<div class="category-page">
  <header class="category-header">
    <h1>About</h1>
  </header>
  <section class="about-content markdown-body">
    ${content}
  </section>
</div>`;
}
