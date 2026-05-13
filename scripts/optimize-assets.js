// Scans articles/ for oversized images and videos.
// `optimizeAssets()` — mutates: re-encodes oversized assets in place via ffmpeg. Used by local builds.
// `checkAssets()` — read-only: fails the build if any asset is oversized. Used by CI (publish task).

const IMAGE_MAX_BYTES = 500 * 1024;
const VIDEO_MAX_BYTES = 3 * 1024 * 1024;

const HERO_MAX_WIDTH = 1600;
const VIDEO_LANDSCAPE_WIDTH = 1280;
const VIDEO_PORTRAIT_WIDTH = 720;
const VIDEO_CRF = 28;
const VIDEO_AUDIO_BITRATE = "96k";
const JPEG_QSCALE = 3; // ffmpeg mjpeg qscale (2-5 typical); lower = higher quality

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
const VIDEO_EXTS = [".mp4", ".webm", ".ogg"];

async function* walk(dir) {
  for await (const entry of Deno.readDir(dir)) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory) yield* walk(path);
    else if (entry.isFile) yield path;
  }
}

function extOf(path) {
  const i = path.lastIndexOf(".");
  return i === -1 ? "" : path.slice(i).toLowerCase();
}

function isHeroImage(path) {
  // Hero images live directly under articles/{category}/ and match NNN-*.{ext}
  return /^articles\/[^/]+\/\d{3}-[^/]+\.(png|jpe?g|webp|gif)$/i.test(path);
}

async function run(cmd) {
  const p = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = await p.output();
  return {
    code,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
  };
}

async function hasFfmpeg() {
  try {
    const r = await run(["ffmpeg", "-version"]);
    return r.code === 0;
  } catch {
    return false;
  }
}

async function probeVideo(path) {
  const r = await run([
    "ffprobe",
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=p=0",
    path,
  ]);
  const [w, h] = r.stdout.trim().split(",").map(Number);
  return { width: w, height: h };
}

async function convertImage(path) {
  const isPngHero = isHeroImage(path) && extOf(path) === ".png";
  const target = isPngHero ? path.replace(/\.png$/i, ".jpg") : path;
  const tmp = `${target}.tmp${extOf(target)}`;

  const vf =
    `scale='min(${HERO_MAX_WIDTH},iw)':-2:flags=lanczos,format=yuvj420p`;
  const r = await run([
    "ffmpeg",
    "-y",
    "-i",
    path,
    "-vf",
    vf,
    "-q:v",
    String(JPEG_QSCALE),
    tmp,
  ]);
  if (r.code !== 0) {
    try {
      await Deno.remove(tmp);
    } catch { /* ignore */ }
    throw new Error(`ffmpeg failed for ${path}:\n${r.stderr}`);
  }
  await Deno.rename(tmp, target);
  if (isPngHero && target !== path) await Deno.remove(path);
  return target;
}

async function convertVideo(path) {
  const { width, height } = await probeVideo(path);
  const portrait = height > width;
  const targetWidth = portrait ? VIDEO_PORTRAIT_WIDTH : VIDEO_LANDSCAPE_WIDTH;
  const tmp = `${path}.tmp.mp4`;

  const r = await run([
    "ffmpeg",
    "-y",
    "-i",
    path,
    "-vf",
    `scale='min(${targetWidth},iw)':-2:flags=lanczos`,
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    String(VIDEO_CRF),
    "-c:a",
    "aac",
    "-b:a",
    VIDEO_AUDIO_BITRATE,
    "-movflags",
    "+faststart",
    tmp,
  ]);
  if (r.code !== 0) {
    try {
      await Deno.remove(tmp);
    } catch { /* ignore */ }
    throw new Error(`ffmpeg failed for ${path}:\n${r.stderr}`);
  }
  await Deno.rename(tmp, path);
  return path;
}

function fmtSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

async function scan(root) {
  const oversized = [];
  for await (const path of walk(root)) {
    const ext = extOf(path);
    const kind = IMAGE_EXTS.includes(ext)
      ? "image"
      : VIDEO_EXTS.includes(ext)
      ? "video"
      : null;
    if (!kind) continue;
    const { size } = await Deno.stat(path);
    const limit = kind === "image" ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES;
    if (size > limit) oversized.push({ path, size, kind });
  }
  return oversized;
}

function reportOversized(oversized) {
  console.error(`Found ${oversized.length} oversized asset(s):`);
  for (const a of oversized) {
    console.error(`  [${a.kind}] ${a.path} — ${fmtSize(a.size)}`);
  }
}

// Read-only: fail the build if any asset exceeds limits. Used by CI.
export async function checkAssets(root = "articles") {
  const oversized = await scan(root);
  if (oversized.length === 0) return { count: 0 };
  reportOversized(oversized);
  console.error(
    "\nRun `deno task build` locally to auto-optimize, then commit the result.",
  );
  Deno.exit(1);
}

// Mutating: re-encode any oversized assets in place. Used by local builds.
export async function optimizeAssets(root = "articles") {
  const oversized = await scan(root);
  if (oversized.length === 0) return { count: 0 };

  if (!(await hasFfmpeg())) {
    reportOversized(oversized);
    console.error(
      "\nffmpeg is not installed — cannot auto-optimize. Install it (e.g. `sudo apt install ffmpeg`) and re-run.",
    );
    Deno.exit(1);
  }

  console.log(`Optimizing ${oversized.length} oversized asset(s)...`);
  let before = 0, after = 0;
  for (const a of oversized) {
    const newPath = a.kind === "image"
      ? await convertImage(a.path)
      : await convertVideo(a.path);
    const newSize = (await Deno.stat(newPath)).size;
    before += a.size;
    after += newSize;
    const suffix = newPath === a.path ? "" : ` → ${newPath}`;
    console.log(
      `  ${a.path}: ${fmtSize(a.size)} -> ${fmtSize(newSize)}${suffix}`,
    );
  }
  console.log(
    `Saved ${fmtSize(before - after)} (${fmtSize(before)} -> ${
      fmtSize(after)
    })`,
  );
  return { count: oversized.length, before, after };
}

if (import.meta.main) await optimizeAssets();
