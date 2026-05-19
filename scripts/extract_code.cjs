const fs = require('fs');
const path = require('path');

const EXCLUDE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', '.gemini', '.vscode', '.idea', 'scripts'];
const EXCLUDE_FILES = ['project_code.txt', 'package-lock.json', '.gitignore', 'README.md'];
const INCLUDE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.json'];

const rootDir = process.cwd();
const outputFile = path.join(rootDir, 'project_code.txt');

function shouldProcess(filePath) {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
        return !EXCLUDE_DIRS.includes(path.basename(filePath));
    }
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath);
    return INCLUDE_EXTENSIONS.includes(ext) && !EXCLUDE_FILES.includes(fileName);
}

function traverseAndExtract(dir, stream) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (shouldProcess(fullPath)) {
            if (fs.statSync(fullPath).isDirectory()) {
                traverseAndExtract(fullPath, stream);
            } else {
                const relativePath = path.relative(rootDir, fullPath);
                stream.write(`\n--- FILE: ${relativePath} ---\n`);
                const content = fs.readFileSync(fullPath, 'utf8');
                stream.write(content);
                stream.write('\n');
            }
        }
    }
}

const writeStream = fs.createWriteStream(outputFile);
writeStream.on('open', () => {
    console.log(`Extracting code to ${outputFile}...`);
    traverseAndExtract(rootDir, writeStream);
    writeStream.end();
});

writeStream.on('finish', () => {
    console.log('Extraction complete!');
});

writeStream.on('error', (err) => {
    console.error('Error writing to file:', err);
});
