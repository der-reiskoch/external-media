const fs = require("fs");
const path = require("path");

const IMAGE_EXTENSIONS = [".JPG", ".jpeg"];

function processFile(filePath) {
  const ext = path.extname(filePath);
  const dir = path.dirname(filePath);
  const name = path.basename(filePath, path.extname(filePath));

  if (IMAGE_EXTENSIONS.includes(ext)) {
    const newPath = path.join(dir, `${name}.jpg`);

    fs.rename(filePath, newPath, (err) => {
      if (err) {
        console.error(`Error renaming ${filePath}:`, err);
      } else {
        console.log(`Renamed: ${filePath} -> ${newPath}`);
      }
    });
  }
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const dirPath = path.join(dir, file);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, file));
  });
}

function prepareFiles() {
  const startDir = process.argv[2] || ".";

  console.log(`Processing files in: ${path.resolve(startDir)}`);
  console.log("Converting image extensions to lowercase...\n");

  walkDir(startDir, (filePath) => {
    processFile(filePath);
  });

  console.log("\nProcessing complete!");
}

prepareFiles();
