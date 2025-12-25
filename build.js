import { marked } from "marked";
import { parse as parseYaml } from "yaml";
import { createHighlighter } from "shiki";
import { layout } from "./templates/layout.js";
import { homePage } from "./templates/home-page.js";
import { postPage } from "./templates/post-page.js";
import { categoryPage } from "./templates/category-page.js";

const SITE_TITLE = "sobanieca";
const SITE_AUTHOR = "sobanieca";
const CATEGORIES = {
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
function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content };

  const [, frontMatter, markdown] = match;
  return {
    data: parseYaml(frontMatter),
    content: markdown,
  };
}

// Generate slug from filename
function getSlugFromFilename(filename) {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
}

// Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Read all posts
async function readPosts() {
  const posts = [];

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
      const html = marked.parse(content);

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

// Build site
async function build() {
  console.log("Building site...");

  // Initialize Shiki highlighter with cyberpunk theme
  console.log("Initializing Shiki...");
  const highlighter = await createHighlighter({
    themes: ["synthwave-84", "tokyo-night"],
    langs: [
      "javascript",
      "typescript",
      "bash",
      "lua",
      "vim",
      "dockerfile",
      "powershell",
      "json",
      "yaml",
      "html",
      "css",
      "markdown",
    ],
  });

  // Configure marked to use Shiki for syntax highlighting
  marked.use({
    async: false,
    renderer: {
      code(code, lang) {
        if (!lang) {
          return `<pre><code>${code}</code></pre>`;
        }
        try {
          const html = highlighter.codeToHtml(code, {
            lang: lang,
            themes: {
              light: "synthwave-84",
              dark: "synthwave-84",
            },
          });
          return html;
        } catch (e) {
          console.warn(`Failed to highlight ${lang}: ${e.message}`);
          return `<pre><code class="language-${lang}">${code}</code></pre>`;
        }
      },
    },
  });

  // Clean and create dist directory
  try {
    await Deno.remove("dist", { recursive: true });
  } catch {
    // Directory doesn't exist, ignore
  }
  await Deno.mkdir("dist", { recursive: true });
  await Deno.mkdir("dist/blog", { recursive: true });
  await Deno.mkdir("dist/category", { recursive: true });
  await Deno.mkdir("dist/assets/css", { recursive: true });

  // Read all posts
  const posts = await readPosts();
  console.log(`Found ${posts.length} posts`);

  // Template context
  const context = {
    siteTitle: SITE_TITLE,
    siteAuthor: SITE_AUTHOR,
    categories: CATEGORIES,
    formatDate,
  };

  // Generate index page
  const homeContent = homePage(posts, context);
  const homeHtml = layout(homeContent, "", undefined, context);
  await Deno.writeTextFile("dist/index.html", homeHtml);
  console.log("Generated index.html");

  // Generate individual post pages
  for (const post of posts) {
    const postContent = postPage(post, context);
    const postHtml = layout(postContent, post.title, undefined, context);
    await Deno.writeTextFile(`dist/blog/${post.slug}.html`, postHtml);
  }
  console.log(`Generated ${posts.length} post pages`);

  // Generate category pages
  for (const category of Object.values(CATEGORIES)) {
    const catContent = categoryPage(category, posts, context);
    const catHtml = layout(catContent, category.name, category.slug, context);
    await Deno.writeTextFile(`dist/category/${category.slug}.html`, catHtml);
  }
  console.log(`Generated ${Object.keys(CATEGORIES).length} category pages`);

  // Copy CSS
  await Deno.copyFile("assets/css/main.css", "dist/assets/css/main.css");
  console.log("Copied CSS");

  console.log("\n✓ Build complete! Output in dist/");
}

if (import.meta.main) {
  await build();
}
