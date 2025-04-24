// tree-generator.js
const fs = require("fs");
const path = require("path");

const IGNORED_DIRS = ["node_modules", ".git", ".next", "build", "dist", "out"];
const MAX_DEPTH = 3;
let result = "";

function printTree(dir, depth = 0, prefix = "") {
  if (depth > MAX_DEPTH) return;
  const files = fs.readdirSync(dir);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(dir, file);
    const isLast = i === files.length - 1;
    const stats = fs.statSync(fullPath);

    const line = `${prefix}${isLast ? "└── " : "├── "}${file}\n`;
    result += line;

    if (stats.isDirectory() && !IGNORED_DIRS.includes(file)) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      printTree(fullPath, depth + 1, newPrefix);
    }
  }
}

// Start from current directory
const root = process.cwd();
result += `${path.basename(root)}\n`;
printTree(root);

// Save to file
fs.writeFileSync("tree-output.txt", result, "utf-8");
console.log("✅ تم إنشاء شجرة المجلدات في ملف tree-output.txt");
 