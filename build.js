import { marked } from "marked";
import { parse as parseYaml } from "yaml";
import { createHighlighter } from "shiki";
import { layout } from "./templates/layout.js";
import { homePage } from "./templates/home-page.js";
import { articlePage } from "./templates/article-page.js";
import { categoryPage } from "./templates/category-page.js";
import { aboutPage } from "./templates/about-page.js";

const SITE_TITLE = "Adam Sobaniec - Software Developer";
const SITE_AUTHOR = "Adam Sobaniec";
const CATEGORIES = {
  general: {
    name: "General",
    icon: "general",
    description: "General development topics and thoughts",
    slug: "general",
  },
  "build-anywhere": {
    name: "Build Anywhere",
    icon: "build-anywhere",
    description: "Cross-platform development strategies",
    slug: "build-anywhere",
  },
  "build-on-the-go": {
    name: "Build on the Go",
    icon: "build-on-the-go",
    description: "Mobile and on-the-go development workflows",
    slug: "build-on-the-go",
  },
  "terminal-dev": {
    name: "Terminal Dev",
    icon: "terminal-dev",
    description: "Terminal-based development workflows, IDEs, and editors",
    slug: "terminal-dev",
  },
  tools: {
    name: "Tools",
    icon: "tools",
    description: "Development tools, utilities, and productivity enhancers",
    slug: "tools",
  },
};

function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content };

  const [, frontMatter, markdown] = match;
  return {
    data: parseYaml(frontMatter),
    content: markdown,
  };
}

function getSlugFromFilename(filename) {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function copyDir(src, dest) {
  await Deno.mkdir(dest, { recursive: true });

  for await (const entry of Deno.readDir(src)) {
    const srcPath = `${src}/${entry.name}`;
    const destPath = `${dest}/${entry.name}`;

    if (entry.isDirectory) {
      await copyDir(srcPath, destPath);
    } else {
      await Deno.copyFile(srcPath, destPath);
    }
  }
}

async function readArticles() {
  const articles = [];

  for await (const dirEntry of Deno.readDir("articles")) {
    if (!dirEntry.isDirectory) continue;

    const category = dirEntry.name;
    const categoryPath = `articles/${category}`;

    for await (const file of Deno.readDir(categoryPath)) {
      if (!file.name.endsWith(".md")) continue;

      const filePath = `${categoryPath}/${file.name}`;
      const fileContent = await Deno.readTextFile(filePath);
      const { data, content } = parseFrontMatter(fileContent);

      const slug = getSlugFromFilename(file.name);
      const html = marked.parse(content);

      articles.push({
        title: data.title || "Untitled",
        date: data.date,
        categories: data.categories || [category],
        excerpt: data.excerpt || "",
        content: html,
        slug,
        url: `/articles/${slug}.html`,
      });
    }
  }

  return articles.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

async function build() {
  console.log("Building site...");

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

  try {
    await Deno.remove("dist", { recursive: true });
  } catch {
  }
  await Deno.mkdir("dist", { recursive: true });
  await Deno.mkdir("dist/articles", { recursive: true });
  await Deno.mkdir("dist/category", { recursive: true });

  const articles = await readArticles();
  console.log(`Found ${articles.length} articles`);

  const context = {
    siteTitle: SITE_TITLE,
    siteAuthor: SITE_AUTHOR,
    categories: CATEGORIES,
    formatDate,
  };

  const homeContent = homePage(articles, context);
  const homeHtml = layout(homeContent, "", null, context);
  await Deno.writeTextFile("dist/index.html", homeHtml);
  console.log("Generated index.html");

  // Generate about page
  const aboutMd = await Deno.readTextFile("about.md");
  const { data: aboutData, content: aboutMarkdown } = parseFrontMatter(aboutMd);
  const aboutHtmlContent = marked.parse(aboutMarkdown);
  const aboutContent = aboutPage(aboutHtmlContent, context);
  const aboutHtml = layout(aboutContent, aboutData.title || "About", "about", context);
  await Deno.writeTextFile("dist/about-me.html", aboutHtml);
  console.log("Generated about-me.html");

  for (const article of articles) {
    const articleContent = articlePage(article, context);
    const articleHtml = layout(articleContent, article.title, undefined, context);
    await Deno.writeTextFile(`dist/articles/${article.slug}.html`, articleHtml);
  }
  console.log(`Generated ${articles.length} article pages`);

  for (const category of Object.values(CATEGORIES)) {
    const catContent = categoryPage(category, articles, context);
    const catHtml = layout(catContent, category.name, category.slug, context);
    await Deno.writeTextFile(`dist/category/${category.slug}.html`, catHtml);
  }
  console.log(`Generated ${Object.keys(CATEGORIES).length} category pages`);

  await copyDir("assets", "dist/assets");
  console.log("Copied assets");

  console.log("\n✓ Build complete! Output in dist/");
}

if (import.meta.main) {
  await build();
}
