use crate::content::{Site, url_of};
use crate::markdown::escape;
use anyhow::{Context, Result, bail};
use std::fs;

pub const SITE_TITLE: &str = "Adam Sobaniec - Software Developer";

/// Finds the `<meta name="description" ...>` tag: its start and its end
fn description_tag(page: &str) -> Option<(usize, usize)> {
    let mut from = 0;
    while let Some(offset) = page[from..].find("<meta") {
        let start = from + offset;
        let end = start + page[start..].find('>')? + 1;
        let tag = page[start..end]
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ");
        if tag.contains("name=\"description\"") {
            return Some((start, end));
        }
        from = end;
    }
    None
}

/// One copy of the built page per route, with the title and the description of that route.
/// GitHub Pages serves /articles/tools/jsonr from articles/tools/jsonr.html. The imp router takes
/// over in the browser, and writes the title and the description again on every navigation.
pub fn write_route_pages(site: &Site) -> Result<()> {
    let page = fs::read_to_string("dist/index.html").context("cannot read dist/index.html")?;
    let (Some(title_start), Some(title_end), Some((meta_start, meta_end))) = (
        page.find("<title>"),
        page.find("</title>").map(|end| end + "</title>".len()),
        description_tag(&page),
    ) else {
        bail!("dist/index.html has no <title> or description meta tag");
    };
    if title_end > meta_start {
        bail!("dist/index.html has its description meta tag before its <title>");
    }

    let write = |file: &str, title: &str, description: &str| -> Result<()> {
        let title = format!("{title} - {SITE_TITLE}");
        let meta = if description.is_empty() {
            page[meta_start..meta_end].to_string()
        } else {
            format!(
                "<meta name=\"description\" content=\"{}\">",
                escape(description)
            )
        };
        let html = format!(
            "{}<title>{}</title>{}{meta}{}",
            &page[..title_start],
            escape(&title),
            &page[title_end..meta_start],
            &page[meta_end..]
        );
        let path = format!("dist/{file}");
        if let Some((folder, _)) = path.rsplit_once('/') {
            fs::create_dir_all(folder)?;
        }
        fs::write(&path, html).with_context(|| format!("cannot write {path}"))
    };

    write("about-me.html", &site.about_title, "")?;
    write("projects.html", "Projects", "")?;
    for category in &site.categories {
        write(
            &format!("category/{}.html", category.slug),
            &category.name,
            &category.description,
        )?;
    }
    for article in &site.articles {
        write(
            &format!("{}.html", &url_of(article)[1..]),
            &article.title,
            &article.excerpt,
        )?;
        // The address before the category was part of it: the page forwards to the article
        write(
            &format!("articles/{}.html", article.slug),
            &article.title,
            &article.excerpt,
        )?;
    }
    // Every other path: the router shows its page, or the "not found" page
    fs::copy("dist/index.html", "dist/404.html")?;

    println!(
        "Generated {} route pages",
        3 + site.categories.len() + 2 * site.articles.len()
    );
    Ok(())
}

pub fn write_maintenance_page() -> Result<()> {
    println!("Under maintenance mode enabled");
    let _ = fs::remove_dir_all("dist");
    fs::create_dir_all("dist")?;
    fs::write(
        "dist/index.html",
        r#"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Under Maintenance</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
      color: #333;
    }
    h1 { font-size: 2rem; }
  </style>
</head>
<body>
  <h1>Under maintenance</h1>
</body>
</html>"#,
    )?;
    println!("\n✓ Under maintenance page generated in dist/");
    Ok(())
}
