//! Builds the site in two steps:
//!
//! 1. Content: reads the Markdown articles and about.md, renders them to HTML (pulldown-cmark) and
//!    writes them as JS modules under src/content/, which the imp app imports. Each article becomes
//!    its own module, loaded lazily as an imp area. Its code blocks are left to imp's codeBlock,
//!    which highlights them in the browser. The images go to public/.
//! 2. App: runs `imp build` into dist/, then writes a copy of the built page for every route
//!    (articles/<slug>.html, category/<slug>.html, ...) with its own title and description, so
//!    GitHub Pages answers a deep link with 200, plus 404.html for every other path.
//!
//! cargo content          step 1 only (run it before `imp start`)
//! cargo dev              step 1, then `imp start`
//! cargo site             both steps, analytics off
//! cargo site --publish   both steps with the prod environment (analytics on), assets checked only
//! cargo serve            serves dist/ the way GitHub Pages does
//! cargo verify           formatting, lints, tests and the checks of the articles

mod assets;
mod content;
mod frontmatter;
mod markdown;
mod pages;
mod serve;

use anyhow::{Context, Result, bail};
use std::path::{Path, PathBuf};
use std::process::{Command, ExitCode};

/// Set to true to serve a maintenance placeholder instead of the full site
const UNDER_MAINTENANCE: bool = false;

fn root() -> PathBuf {
    let manifest = Path::new(env!("CARGO_MANIFEST_DIR")).join("..");
    manifest.canonicalize().unwrap_or(manifest)
}

fn is_package_variable_of_xtask(name: &str) -> bool {
    name.starts_with("CARGO_PKG_")
        || name.starts_with("CARGO_MANIFEST_")
        || matches!(
            name,
            "CARGO_CRATE_NAME" | "CARGO_BIN_NAME" | "CARGO_PRIMARY_PACKAGE"
        )
}

fn run(program: &str, args: &[&str]) -> Result<()> {
    println!("> {program} {}", args.join(" "));
    let mut command = Command::new(program);
    if program == "cargo" {
        for (name, _) in std::env::vars_os() {
            if name.to_str().is_some_and(is_package_variable_of_xtask) {
                command.env_remove(name);
            }
        }
    }
    let status = command
        .args(args)
        .status()
        .with_context(|| format!("cannot run {program}"))?;
    if !status.success() {
        bail!("{program} {} failed", args.join(" "));
    }
    Ok(())
}

fn content() -> Result<content::Site> {
    println!("Generating content...");
    content::build_content()
}

fn site(publish: bool) -> Result<()> {
    println!("Building site...");
    if publish {
        assets::check_assets()?;
    } else {
        assets::optimize_assets()?;
    }
    if UNDER_MAINTENANCE {
        return pages::write_maintenance_page();
    }
    let site = content::build_content()?;
    // imp refuses an output folder with files it did not write, such as the route pages below
    let _ = std::fs::remove_dir_all("dist");
    // The prod environment turns the ANALYTICS flag on. A local build leaves it off.
    if publish {
        run("imp", &["build", "--env", "prod"])?;
    } else {
        run("imp", &["build"])?;
    }
    pages::write_route_pages(&site)?;
    println!("\n✓ Build complete! Output in dist/");
    Ok(())
}

/// Fails on a `TODO:` left in an article
fn check_todos() -> Result<()> {
    let output = Command::new("git")
        .args([
            "grep",
            "-n",
            "TODO:",
            "--",
            "articles/*.md",
            "articles/**/*.md",
        ])
        .output()
        .context("cannot run git grep")?;
    if !output.stdout.is_empty() {
        print!("{}", String::from_utf8_lossy(&output.stdout));
        bail!("Found TODO: markers in the articles. Please resolve them before merging.");
    }
    Ok(())
}

fn verify() -> Result<()> {
    run("cargo", &["fmt", "--all", "--check"])?;
    run(
        "cargo",
        &[
            "clippy",
            "--workspace",
            "--all-targets",
            "--",
            "-D",
            "warnings",
        ],
    )?;
    run("cargo", &["test", "--workspace", "--quiet"])?;
    run("imp", &["fmt", "--check"])?;
    // imp lint reads the app with its generated content
    content()?;
    run("imp", &["lint"])?;
    check_todos()?;
    assets::check_assets()?;
    println!("\n✓ Everything checks out");
    Ok(())
}

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if let Err(error) = std::env::set_current_dir(root()) {
        eprintln!("cannot enter the repository: {error}");
        return ExitCode::FAILURE;
    }
    let result = match args.first().map(String::as_str) {
        Some("content") => content().map(|_| {
            println!("\n✓ Content generated - run `imp start` to serve the site");
        }),
        Some("dev") => content().and_then(|_| run("imp", &["start"])),
        Some("site") => site(args.iter().any(|arg| arg == "--publish")),
        Some("serve") => serve::serve(),
        Some("verify") => verify(),
        _ => {
            eprintln!("usage: cargo xtask <content|dev|site [--publish]|serve|verify>");
            return ExitCode::FAILURE;
        }
    };
    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("\n✗ {error:#}");
            ExitCode::FAILURE
        }
    }
}
