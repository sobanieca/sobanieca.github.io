import { marked } from "marked";
import { parse as parseYaml } from "yaml";

interface Post {
  title: string;
  date: string;
  categories: string[];
  excerpt: string;
  content: string;
  slug: string;
  url: string;
}

interface Category {
  name: string;
  icon: string;
  description: string;
  slug: string;
}

const SITE_TITLE = "sobanieca";
const SITE_AUTHOR = "sobanieca";
const CATEGORIES: Record<string, Category> = {
  general: {
    name: "General",
    icon: "general",
    description: "General development topics and thoughts",
    slug: "general",
  },
  "build-remotely": {
    name: "Build Remotely",
    icon: "build-remotely",
    description: "Remote development workflows and tools",
    slug: "build-remotely",
  },
  "build-anywhere": {
    name: "Build Anywhere",
    icon: "build-anywhere",
    description: "Cross-platform development strategies",
    slug: "build-anywhere",
  },
  neovim: {
    name: "Neovim",
    icon: "neovim",
    description: "Neovim tips, tricks, and configurations",
    slug: "neovim",
  },
  tools: {
    name: "Tools",
    icon: "tools",
    description: "Developer tools and productivity",
    slug: "tools",
  },
};

// Parse front matter from markdown
function parseFrontMatter(content: string): { data: any; content: string } {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content };

  const [, frontMatter, markdown] = match;
  return {
    data: parseYaml(frontMatter),
    content: markdown,
  };
}

// Generate slug from filename
function getSlugFromFilename(filename: string): string {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
}

// Format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Read all posts
async function readPosts(): Promise<Post[]> {
  const posts: Post[] = [];

  for await (const dirEntry of Deno.readDir("_posts")) {
    if (!dirEntry.isDirectory) continue;

    const category = dirEntry.name;
    const categoryPath = `_posts/${category}`;

    for await (const file of Deno.readDir(categoryPath)) {
      if (!file.name.endsWith(".md")) continue;

      const filePath = `${categoryPath}/${file.name}`;
      const fileContent = await Deno.readTextFile(filePath);
      const { data, content } = parseFrontMatter(fileContent);

      const slug = getSlugFromFilename(file.name);
      const html = marked.parse(content) as string;

      posts.push({
        title: data.title || "Untitled",
        date: data.date,
        categories: data.categories || [category],
        excerpt: data.excerpt || "",
        content: html,
        slug,
        url: `/blog/${slug}.html`,
      });
    }
  }

  return posts.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// HTML Templates
function layout(
  content: string,
  title: string,
  activeCategory?: string
): string {
  const categoriesNav = Object.entries(CATEGORIES)
    .map(
      ([key, cat]) => `
      <li class="nav-item">
        <a href="/category/${cat.slug}.html" class="${
        activeCategory === cat.slug ? "active" : ""
      }">
          <span>${cat.name}</span>
        </a>
      </li>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title ? `${title} - ` : ""}${SITE_TITLE}</title>
  <link rel="stylesheet" href="/assets/css/main.css">
</head>
<body>
  <div class="page-wrapper">
    <aside class="sidebar">
      <a href="/" class="site-title">${SITE_TITLE}</a>
      <nav>
        <ul class="nav-categories">
          ${categoriesNav}
        </ul>
      </nav>
    </aside>

    <main class="main-content">
      ${content}
      <footer>
        <p>&copy; ${new Date().getFullYear()} ${SITE_AUTHOR}. Built with Deno.</p>
      </footer>
    </main>
  </div>
</body>
</html>`;
}

function postCard(post: Post): string {
  const category = post.categories[0];
  const categoryData = CATEGORIES[category];

  return `<article class="post-card">
  <span class="category-tag">${categoryData?.name || category}</span>
  <h2 class="post-title">
    <a href="${post.url}">${post.title}</a>
  </h2>
  <div class="post-meta">
    <span class="author">${SITE_AUTHOR}</span>
    <span class="separator">•</span>
    <time datetime="${post.date}">${formatDate(post.date)}</time>
  </div>
  <p class="post-excerpt">${post.excerpt}</p>
  <a href="${post.url}" class="read-more">Read more</a>
</article>`;
}

function postPage(post: Post): string {
  const category = post.categories[0];
  const categoryData = CATEGORIES[category];

  const content = `<article class="post-page">
  <nav class="breadcrumb">
    <a href="/">Home</a>
    <span> / </span>
    <a href="/category/${category}.html">${categoryData?.name || category}</a>
    <span> / </span>
    <span>${post.title}</span>
  </nav>

  <header>
    <span class="category-tag">${categoryData?.name || category}</span>
    <h1>${post.title}</h1>
    <div class="post-meta">
      <span>${SITE_AUTHOR}</span>
      <span>•</span>
      <time datetime="${post.date}">${formatDate(post.date)}</time>
    </div>
  </header>

  <div class="post-content">
    ${post.content}
  </div>

  <div class="post-footer">
    <a href="/category/${category}.html" class="btn btn-secondary">
      ← Back to ${categoryData?.name || category}
    </a>
  </div>
</article>`;

  return layout(content, post.title);
}

function homePage(posts: Post[]): string {
  const [featuredPost, ...recentPosts] = posts;

  const heroHtml = featuredPost
    ? `<section class="hero-post">
    <span class="category-tag">${CATEGORIES[featuredPost.categories[0]]?.name}</span>
    <h1 class="hero-title">${featuredPost.title}</h1>
    <p class="hero-excerpt">${featuredPost.excerpt}</p>
    <div class="hero-meta">
      <span class="author">${SITE_AUTHOR}</span>
      <span>•</span>
      <time datetime="${featuredPost.date}">${formatDate(featuredPost.date)}</time>
    </div>
    <a href="${featuredPost.url}" class="hero-cta">Read Article</a>
  </section>`
    : "";

  const recentHtml = recentPosts.length
    ? `<section class="posts-grid">
    <h2>Recent Posts</h2>
    <div class="card-grid">
      ${recentPosts.slice(0, 6).map((post) => postCard(post)).join("")}
    </div>
  </section>`
    : "";

  const content = `<div class="home-page">
  ${heroHtml}
  ${recentHtml}
</div>`;

  return layout(content, "");
}

function categoryPage(category: Category, posts: Post[]): string {
  const categoryPosts = posts.filter((p) =>
    p.categories.includes(category.slug)
  );

  const postsHtml = categoryPosts.length
    ? `<div class="card-grid">
      ${categoryPosts.map((post) => postCard(post)).join("")}
    </div>`
    : `<div class="empty-state">
      <p>No posts in this category yet.</p>
      <p>Check back soon for new content!</p>
    </div>`;

  const content = `<div class="category-page">
  <header class="category-header">
    <h1>${category.name}</h1>
    <p class="category-description">${category.description}</p>
  </header>
  <section class="posts-grid">
    ${postsHtml}
  </section>
</div>`;

  return layout(content, category.name, category.slug);
}

// Build site
async function build() {
  console.log("Building site...");

  // Clean and create _site directory
  try {
    await Deno.remove("_site", { recursive: true });
  } catch {
    // Directory doesn't exist, ignore
  }
  await Deno.mkdir("_site", { recursive: true });
  await Deno.mkdir("_site/blog", { recursive: true });
  await Deno.mkdir("_site/category", { recursive: true });
  await Deno.mkdir("_site/assets/css", { recursive: true });

  // Read all posts
  const posts = await readPosts();
  console.log(`Found ${posts.length} posts`);

  // Generate index page
  await Deno.writeTextFile("_site/index.html", homePage(posts));
  console.log("Generated index.html");

  // Generate individual post pages
  for (const post of posts) {
    await Deno.writeTextFile(`_site/blog/${post.slug}.html`, postPage(post));
  }
  console.log(`Generated ${posts.length} post pages`);

  // Generate category pages
  for (const category of Object.values(CATEGORIES)) {
    await Deno.writeTextFile(
      `_site/category/${category.slug}.html`,
      categoryPage(category, posts)
    );
  }
  console.log(`Generated ${Object.keys(CATEGORIES).length} category pages`);

  // Copy CSS
  await Deno.copyFile("assets/css/main.css", "_site/assets/css/main.css");
  console.log("Copied CSS");

  console.log("\n✓ Build complete! Output in _site/");
}

if (import.meta.main) {
  await build();
}
