#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

const CONTENT_DIR = path.resolve(__dirname, "../../ahaan-thai/content");
const YOUTUBE_DIR = path.resolve(__dirname, "../youtube");

function extractVideoIds(content) {
  const ids = new Set();
  for (const [, id] of content.matchAll(/\/youtube\/([a-zA-Z0-9_-]+)/g)) ids.add(id);
  for (const [, id] of content.matchAll(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g)) ids.add(id);
  for (const [, id] of content.matchAll(/youtu\.be\/([a-zA-Z0-9_-]+)/g)) ids.add(id);
  return ids;
}

function findMarkdownFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...findMarkdownFiles(full));
    else if (entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    });
    req.on("error", (err) => {
      try { fs.unlinkSync(dest); } catch {}
      reject(err);
    });
  });
}

async function main() {
  const allIds = new Set();
  for (const file of findMarkdownFiles(CONTENT_DIR)) {
    for (const id of extractVideoIds(fs.readFileSync(file, "utf8"))) {
      allIds.add(id);
    }
  }

  console.log(`Found ${allIds.size} unique YouTube IDs in content`);

  const missing = [...allIds].filter(
    (id) => !fs.existsSync(path.join(YOUTUBE_DIR, `${id}.jpg`)) || !fs.existsSync(path.join(YOUTUBE_DIR, `${id}.webp`))
  );

  if (missing.length === 0) {
    console.log("All thumbnails already present.");
    return;
  }

  console.log(`Downloading ${missing.length} missing thumbnail(s)...\n`);

  let ok = 0;
  let fail = 0;
  for (const id of missing) {
    const jpgPath = path.join(YOUTUBE_DIR, `${id}.jpg`);
    const webpPath = path.join(YOUTUBE_DIR, `${id}.webp`);
    process.stdout.write(`  ${id} ... `);
    try {
      await download(`https://img.youtube.com/vi/${id}/sddefault.jpg`, jpgPath);
      execSync(`cwebp -q 80 "${jpgPath}" -o "${webpPath}"`, { stdio: "pipe" });
      console.log("ok");
      ok++;
    } catch (err) {
      console.log(`FAILED (${err.message})`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} downloaded, ${fail} failed.`);
}

main();
