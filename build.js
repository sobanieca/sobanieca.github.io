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
    description: "Articles about general development topics and thoughts",
    slug: "general",
  },
  "build-anywhere": {
    name: "Build Anywhere",
    icon: "build-anywhere",
    description: "Articles about building on remote servers",
    slug: "build-anywhere",
  },
  "build-on-the-go": {
    name: "Build on the Go",
    icon: "build-on-the-go",
    description: "Articles about building on the go - directly on mobile phone!",
    slug: "build-on-the-go",
  },
  "build-in-terminal": {
    name: "Build in terminal",
    icon: "build-in-terminal",
    description: "Articles about tools for building in terminal - Neovim, tmux",
    slug: "build-in-terminal",
  },
  tools: {
    name: "Tools",
    icon: "tools",
    description: "Articles about various development tools",
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

function getDateFromFilename(filename) {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
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

async function findArticleImage(categoryPath, baseName) {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  for (const ext of imageExtensions) {
    const imagePath = `${categoryPath}/${baseName}${ext}`;
    try {
      await Deno.stat(imagePath);
      return { path: imagePath, ext };
    } catch {
      // File doesn't exist, try next extension
    }
  }
  return null;
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
      const baseName = file.name.replace(/\.md$/, "");
      const html = marked.parse(content);

      // Check for article image
      const imageInfo = await findArticleImage(categoryPath, baseName);
      let image = null;
      if (imageInfo) {
        image = {
          src: imageInfo.path,
          dest: `/assets/images/articles/${slug}${imageInfo.ext}`,
        };
      }

      articles.push({
        title: data.title || "Untitled",
        date: getDateFromFilename(file.name),
        categorySlug: category,
        excerpt: data.excerpt || "",
        content: html,
        slug,
        url: `/articles/${slug}.html`,
        image,
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

  // Copy article images
  await Deno.mkdir("dist/assets/images/articles", { recursive: true });
  for (const article of articles) {
    if (article.image) {
      await Deno.copyFile(article.image.src, `dist${article.image.dest}`);
    }
  }
  const articlesWithImages = articles.filter((a) => a.image).length;
  if (articlesWithImages > 0) {
    console.log(`Copied ${articlesWithImages} article images`);
  }

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

  // Group articles by category for prev/next navigation
  const articlesByCategory = {};
  for (const article of articles) {
    if (!articlesByCategory[article.categorySlug]) {
      articlesByCategory[article.categorySlug] = [];
    }
    articlesByCategory[article.categorySlug].push(article);
  }

  for (const article of articles) {
    const categoryArticles = articlesByCategory[article.categorySlug];
    const currentIndex = categoryArticles.findIndex(a => a.slug === article.slug);

    // Articles are sorted newest first, so:
    // - "older" = next in array (higher index)
    // - "newer" = previous in array (lower index)
    const olderArticle = currentIndex < categoryArticles.length - 1
      ? categoryArticles[currentIndex + 1]
      : null;
    const newerArticle = currentIndex > 0
      ? categoryArticles[currentIndex - 1]
      : null;

    const articleContent = articlePage(article, context, { olderArticle, newerArticle });
    const articleHtml = layout(articleContent, article.title, undefined, context);
    await Deno.writeTextFile(`dist/articles/${article.slug}.html`, articleHtml);
  }
  console.log(`Generated ${articles.length} article pages`);

  // Copy images folders from each category to dist/articles/images
  await Deno.mkdir("dist/articles/images", { recursive: true });
  for (const category of Object.keys(CATEGORIES)) {
    const imagesPath = `articles/${category}/images`;
    try {
      await Deno.stat(imagesPath);
      await copyDir(imagesPath, "dist/articles/images");
    } catch {
      // No images folder for this category
    }
  }
  console.log("Copied category images");

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
