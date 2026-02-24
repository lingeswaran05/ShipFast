const fs = require('fs');
const path = require('path');

const projectFile = path.join(process.cwd(), 'project_code_latest.txt');
const outputRoot = path.join(process.cwd(), 'SHIPFAST');

if (!fs.existsSync(projectFile)) {
  console.error('project_code_latest.txt not found');
  process.exit(1);
}

const content = fs.readFileSync(projectFile, 'utf8');
// Split by delimiter lines --- FILE: <path> ---
const parts = content.split(/--- FILE: (.+?) ---\n/);
for (let i = 1; i < parts.length; i += 2) {
  const relativePath = parts[i].trim();
  const fileContent = parts[i + 1];
  if (!relativePath) continue;
  const targetPath = path.join(outputRoot, relativePath);
  const dir = path.dirname(targetPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(targetPath, fileContent, 'utf8');
  console.log(`Written ${targetPath}`);
}
console.log('Extraction complete');
