import { marked } from "marked";
import { parse as parseYaml } from "yaml";
import { createHighlighter } from "shiki";
import { layout } from "./templates/layout.js";
import { homePage } from "./templates/home-page.js";
import { articlePage } from "./templates/article-page.js";
import { categoryPage } from "./templates/category-page.js";
import { aboutPage } from "./templates/about-page.js";

const SITE_AUTHOR = "Adam Sobaniec";
const SITE_TITLE = `${SITE_AUTHOR} - Software Developer`;

async function readCategories() {
  const categoryList = [];

  for await (const dirEntry of Deno.readDir("articles")) {
    if (!dirEntry.isDirectory) continue;

    const slug = dirEntry.name;
    const categoryPath = `articles/${slug}`;

    try {
      const yamlContent = await Deno.readTextFile(
        `${categoryPath}/category.yaml`,
      );
      const categoryData = parseYaml(yamlContent);

      let icon = "";
      try {
        icon = await Deno.readTextFile(`${categoryPath}/category-icon.svg`);
        icon = icon.trim();
      } catch {
        // No icon file, use empty string
      }

      categoryList.push({
        name: categoryData.name || slug,
        description: categoryData.description || "",
        order: categoryData.order ?? 999,
        slug,
        icon,
      });
    } catch {
      // No category.yaml, skip this directory
      console.warn(`Warning: No category.yaml found in ${categoryPath}`);
    }
  }

  // Sort by order (lower number = first)
  categoryList.sort((a, b) => a.order - b.order);

  // Convert to object preserving sort order
  const categories = {};
  for (const cat of categoryList) {
    categories[cat.slug] = cat;
  }

  return categories;
}

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
    // Directory doesn't exist, ignore
  }
  await Deno.mkdir("dist", { recursive: true });
  await Deno.mkdir("dist/articles", { recursive: true });
  await Deno.mkdir("dist/category", { recursive: true });

  const categories = await readCategories();
  console.log(`Found ${Object.keys(categories).length} categories`);

  const articles = await readArticles();
  console.log(`Found ${articles.length} articles`);

  // Check for duplicate article slugs
  const slugMap = new Map();
  for (const article of articles) {
    if (slugMap.has(article.slug)) {
      const existing = slugMap.get(article.slug);
      console.error(`\n✗ Build failed: Duplicate article slug "${article.slug}"`);
      console.error(`  - ${existing.categorySlug}/${existing.slug} (${existing.date})`);
      console.error(`  - ${article.categorySlug}/${article.slug} (${article.date})`);
      Deno.exit(1);
    }
    slugMap.set(article.slug, article);
  }

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

  const isLocal = Deno.env.get("LOCAL") === "1";

  const context = {
    siteTitle: SITE_TITLE,
    siteAuthor: SITE_AUTHOR,
    categories,
    formatDate,
    isLocal,
  };

  const homeContent = homePage(articles, context);
  const homeHtml = layout(homeContent, "", null, context);
  await Deno.writeTextFile("dist/index.html", homeHtml);
  console.log("Generated index.html");

  // Generate about page
  const aboutMd = await Deno.readTextFile("about.md");
  const { data: aboutData, content: aboutMarkdown } = parseFrontMatter(aboutMd);
  const aboutHtmlContent = marked.parse(aboutMarkdown);
  const aboutContent = aboutPage(aboutHtmlContent, aboutData, context);
  const aboutHtml = layout(
    aboutContent,
    aboutData.title || "About",
    "about",
    context,
  );
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
    const currentIndex = categoryArticles.findIndex((a) =>
      a.slug === article.slug
    );

    // Articles are sorted newest first, so:
    // - "older" = next in array (higher index)
    // - "newer" = previous in array (lower index)
    const olderArticle = currentIndex < categoryArticles.length - 1
      ? categoryArticles[currentIndex + 1]
      : null;
    const newerArticle = currentIndex > 0
      ? categoryArticles[currentIndex - 1]
      : null;

    const articleContent = articlePage(article, context, {
      olderArticle,
      newerArticle,
    });
    const articleHtml = layout(
      articleContent,
      article.title,
      undefined,
      context,
    );
    await Deno.writeTextFile(`dist/articles/${article.slug}.html`, articleHtml);
  }
  console.log(`Generated ${articles.length} article pages`);

  // Copy images folders from each category to dist/articles/images
  await Deno.mkdir("dist/articles/images", { recursive: true });
  for (const category of Object.keys(categories)) {
    const imagesPath = `articles/${category}/images`;
    try {
      await Deno.stat(imagesPath);
      await copyDir(imagesPath, "dist/articles/images");
    } catch {
      // No images folder for this category
    }
  }
  console.log("Copied category images");

  for (const category of Object.values(categories)) {
    const catContent = categoryPage(category, articles, context);
    const catHtml = layout(catContent, category.name, category.slug, context);
    await Deno.writeTextFile(`dist/category/${category.slug}.html`, catHtml);
  }
  console.log(`Generated ${Object.keys(categories).length} category pages`);

  await copyDir("assets", "dist/assets");
  console.log("Copied assets");

  await Deno.copyFile("stats.html", "dist/stats.html");
  console.log("Copied stats.html");

  // Generate site.json with list of trackable pages (filename only, deduplicated)
  // Note: analytics script sends only the filename, not the full path
  const trackablePages = [...new Set([
    "index.html",
    "about-me.html",
    ...articles.map((a) => `${a.slug}.html`),
    ...Object.keys(categories).map((slug) => `${slug}.html`),
  ])];
  await Deno.writeTextFile(
    "dist/site.json",
    JSON.stringify({ pages: trackablePages }, null, 2),
  );
  console.log(`Generated site.json with ${trackablePages.length} trackable pages`);

  console.log("\n✓ Build complete! Output in dist/");
}

if (import.meta.main) {
  await build();
}
