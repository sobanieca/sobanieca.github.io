//! Scans articles/ for oversized images and videos.
//! `optimize_assets` - mutates: re-encodes oversized assets in place with ffmpeg. Used by local
//! builds.
//! `check_assets` - read-only: fails the build if any asset is oversized. Used by CI.

use anyhow::{Context, Result, bail};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

const IMAGE_MAX_BYTES: u64 = 500 * 1024;
const VIDEO_MAX_BYTES: u64 = 3 * 1024 * 1024;

const HERO_MAX_WIDTH: u32 = 1600;
const VIDEO_LANDSCAPE_WIDTH: u32 = 1280;
const VIDEO_PORTRAIT_WIDTH: u32 = 720;
const VIDEO_CRF: u32 = 28;
const VIDEO_AUDIO_BITRATE: &str = "96k";
/// ffmpeg mjpeg qscale (2-5 typical); lower = higher quality
const JPEG_QSCALE: u32 = 3;

const IMAGE_EXTENSIONS: &[&str] = &["png", "jpg", "jpeg", "webp", "gif"];
const VIDEO_EXTENSIONS: &[&str] = &["mp4", "webm", "ogg"];

#[derive(Clone, Copy, PartialEq)]
enum Kind {
    Image,
    Video,
}

struct Oversized {
    path: PathBuf,
    size: u64,
    kind: Kind,
}

fn extension_of(path: &Path) -> String {
    path.extension()
        .map(|extension| extension.to_string_lossy().to_lowercase())
        .unwrap_or_default()
}

/// A hero image lives directly under articles/{category}/ and is named NNN-*.{ext}
fn is_hero_image(path: &Path) -> bool {
    let in_category = path
        .parent()
        .and_then(Path::parent)
        .is_some_and(|root| root == Path::new("articles"));
    let name = path
        .file_name()
        .map(|name| name.to_string_lossy())
        .unwrap_or_default();
    let numbered = name.len() > 4
        && name[..3].chars().all(|c| c.is_ascii_digit())
        && name[3..].starts_with('-');
    in_category && numbered && IMAGE_EXTENSIONS.contains(&extension_of(path).as_str())
}

fn walk(dir: &Path, files: &mut Vec<PathBuf>) -> Result<()> {
    let mut entries = fs::read_dir(dir)?.collect::<std::io::Result<Vec<_>>>()?;
    entries.sort_by_key(|entry| entry.file_name());
    for entry in entries {
        let kind = entry.file_type()?;
        if kind.is_dir() {
            walk(&entry.path(), files)?;
        } else if kind.is_file() {
            files.push(entry.path());
        }
    }
    Ok(())
}

fn scan(root: &str) -> Result<Vec<Oversized>> {
    let mut files = Vec::new();
    walk(Path::new(root), &mut files)?;
    let mut oversized = Vec::new();
    for path in files {
        let extension = extension_of(&path);
        let kind = if IMAGE_EXTENSIONS.contains(&extension.as_str()) {
            Kind::Image
        } else if VIDEO_EXTENSIONS.contains(&extension.as_str()) {
            Kind::Video
        } else {
            continue;
        };
        let size = fs::metadata(&path)?.len();
        let limit = if kind == Kind::Image {
            IMAGE_MAX_BYTES
        } else {
            VIDEO_MAX_BYTES
        };
        if size > limit {
            oversized.push(Oversized { path, size, kind });
        }
    }
    Ok(oversized)
}

fn format_size(bytes: u64) -> String {
    if bytes >= 1024 * 1024 {
        format!("{:.2} MB", bytes as f64 / 1024.0 / 1024.0)
    } else {
        format!("{} KB", (bytes as f64 / 1024.0).round())
    }
}

fn report(oversized: &[Oversized]) {
    eprintln!("Found {} oversized asset(s):", oversized.len());
    for asset in oversized {
        let kind = if asset.kind == Kind::Image {
            "image"
        } else {
            "video"
        };
        eprintln!(
            "  [{kind}] {} - {}",
            asset.path.display(),
            format_size(asset.size)
        );
    }
}

fn ffmpeg(args: &[&str]) -> Result<()> {
    let output = Command::new("ffmpeg")
        .args(args)
        .output()
        .context("cannot run ffmpeg")?;
    if !output.status.success() {
        bail!(
            "ffmpeg failed:\n{}",
            String::from_utf8_lossy(&output.stderr)
        );
    }
    Ok(())
}

fn video_size(path: &Path) -> Result<(u32, u32)> {
    let output = Command::new("ffprobe")
        .args(["-v", "error", "-select_streams", "v:0"])
        .args(["-show_entries", "stream=width,height", "-of", "csv=p=0"])
        .arg(path)
        .output()
        .context("cannot run ffprobe")?;
    let text = String::from_utf8_lossy(&output.stdout);
    let (width, height) = text
        .trim()
        .split_once(',')
        .context("ffprobe gave no size")?;
    Ok((width.parse()?, height.parse()?))
}

fn path_text(path: &Path) -> String {
    path.to_string_lossy().into_owned()
}

/// Re-encodes an image as a JPEG at most HERO_MAX_WIDTH wide. A PNG hero becomes a .jpg.
fn convert_image(path: &Path) -> Result<PathBuf> {
    let png_hero = is_hero_image(path) && extension_of(path) == "png";
    let target = if png_hero {
        path.with_extension("jpg")
    } else {
        path.to_path_buf()
    };
    let temporary = PathBuf::from(format!(
        "{}.tmp.{}",
        target.display(),
        extension_of(&target)
    ));
    let filter = format!("scale='min({HERO_MAX_WIDTH},iw)':-2:flags=lanczos,format=yuvj420p");
    let quality = JPEG_QSCALE.to_string();
    let result = ffmpeg(&[
        "-y",
        "-i",
        &path_text(path),
        "-vf",
        &filter,
        "-q:v",
        &quality,
        &path_text(&temporary),
    ]);
    if let Err(error) = result {
        let _ = fs::remove_file(&temporary);
        return Err(error.context(format!("cannot convert {}", path.display())));
    }
    fs::rename(&temporary, &target)?;
    if png_hero {
        fs::remove_file(path)?;
    }
    Ok(target)
}

fn convert_video(path: &Path) -> Result<PathBuf> {
    let (width, height) = video_size(path)?;
    let target_width = if height > width {
        VIDEO_PORTRAIT_WIDTH
    } else {
        VIDEO_LANDSCAPE_WIDTH
    };
    let temporary = PathBuf::from(format!("{}.tmp.mp4", path.display()));
    let filter = format!("scale='min({target_width},iw)':-2:flags=lanczos");
    let crf = VIDEO_CRF.to_string();
    let result = ffmpeg(&[
        "-y",
        "-i",
        &path_text(path),
        "-vf",
        &filter,
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        &crf,
        "-c:a",
        "aac",
        "-b:a",
        VIDEO_AUDIO_BITRATE,
        "-movflags",
        "+faststart",
        &path_text(&temporary),
    ]);
    if let Err(error) = result {
        let _ = fs::remove_file(&temporary);
        return Err(error.context(format!("cannot convert {}", path.display())));
    }
    fs::rename(&temporary, path)?;
    Ok(path.to_path_buf())
}

/// Read-only: fails if any asset exceeds the limits. Used by CI.
pub fn check_assets() -> Result<()> {
    let oversized = scan("articles")?;
    if oversized.is_empty() {
        return Ok(());
    }
    report(&oversized);
    bail!("Run `cargo site` locally to auto-optimize, then commit the result.");
}

/// Mutating: re-encodes every oversized asset in place. Used by local builds.
pub fn optimize_assets() -> Result<()> {
    let oversized = scan("articles")?;
    if oversized.is_empty() {
        return Ok(());
    }
    let has_ffmpeg = Command::new("ffmpeg")
        .arg("-version")
        .output()
        .is_ok_and(|output| output.status.success());
    if !has_ffmpeg {
        report(&oversized);
        bail!(
            "ffmpeg is not installed - cannot auto-optimize. Install it (e.g. `sudo apt install ffmpeg`) and re-run."
        );
    }

    println!("Optimizing {} oversized asset(s)...", oversized.len());
    let (mut before, mut after) = (0, 0);
    for asset in &oversized {
        let converted = match asset.kind {
            Kind::Image => convert_image(&asset.path)?,
            Kind::Video => convert_video(&asset.path)?,
        };
        let size = fs::metadata(&converted)?.len();
        before += asset.size;
        after += size;
        let renamed = if converted == asset.path {
            String::new()
        } else {
            format!(" -> {}", converted.display())
        };
        println!(
            "  {}: {} -> {}{renamed}",
            asset.path.display(),
            format_size(asset.size),
            format_size(size)
        );
    }
    println!(
        "Saved {} ({} -> {})",
        format_size(before - after.min(before)),
        format_size(before),
        format_size(after)
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hero_images() {
        assert!(is_hero_image(Path::new("articles/tools/100-jsonr.png")));
        assert!(!is_hero_image(Path::new(
            "articles/tools/images/100-jsonr.png"
        )));
        assert!(!is_hero_image(Path::new("articles/tools/cover.png")));
    }
}
