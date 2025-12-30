#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, {
    stdio: "inherit",
    env: {
      ...process.env,
      GIT_TRACE: "1",
      GIT_TRACE_PACKET: "1",
      GIT_CURL_VERBOSE: "1",
    },
  });
}

function normalizeRepoUrl(url) {
  if (!url) return null;

  // Remove npm-style prefix
  if (url.startsWith("git+")) {
    url = url.replace(/^git\+/, "");
  }

  // github:user/repo  OR  user/repo
  if (/^[\w-]+\/[\w.-]+$/.test(url)) {
    return `https://github.com/${url}.git`;
  }

  if (/^github:/.test(url)) {
    return `https://github.com/${url.replace(/^github:/, "")}.git`;
  }

  // github.com:user/repo  → SSH
  if (/^github\.com:/.test(url)) {
    return `git@${url}.git`;
  }

  // Already a valid URL (https or ssh)
  return url;
}

// 1. Load package.json
const pkgPath = path.join(process.cwd(), "package.json");
if (!fs.existsSync(pkgPath)) {
  console.error("❌ package.json not found");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

// 2. Resolve repository URL
let rawUrl = null;

if (typeof pkg.repository === "string") {
  rawUrl = pkg.repository;
} else if (pkg.repository && pkg.repository.url) {
  rawUrl = pkg.repository.url;
}

if (!rawUrl) {
  console.error("❌ No repository field found in package.json");
  process.exit(1);
}

console.log(`ℹ️ Raw repository value: ${rawUrl}`);

const remoteUrl = normalizeRepoUrl(rawUrl);

if (!remoteUrl) {
  console.error("❌ Failed to normalize repository URL");
  process.exit(1);
}

console.log(`✅ Normalized remote URL: ${remoteUrl}`);

// 3. Remove .git directory
const gitDir = path.join(process.cwd(), ".git");
if (fs.existsSync(gitDir)) {
  console.log("🧹 Removing .git directory...");
  fs.rmSync(gitDir, { recursive: true, force: true });
}

// 4. Re-initialize git repository
run("git init");

// 5. Initialize Git LFS and track media files
console.log("📦 Initializing Git LFS...");
run("git lfs install");
run('git lfs track "*.jpg"');
run('git lfs track "*.jpeg"');
run('git lfs track "*.JPG"');
run('git lfs track "*.webp"');
run('git lfs track "*.png"');
console.log("✅ Git LFS configured for image files");

// 6. Add all files and create initial commit
run("git add --verbose .");
run('git commit --verbose -m "Initial commit (history reset) with Git LFS"');

// 7. Set branch and remote
run("git branch -M main");
run(`git remote add origin ${remoteUrl}`);

// 8. Force push
run("git push --force --set-upstream --verbose origin main");

console.log("\n🎉 Git history successfully reset and pushed");
