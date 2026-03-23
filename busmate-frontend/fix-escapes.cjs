const fs = require('fs');
const path = require('path');

const pagesDir = 'e:/Semester 3/Web develepment/BusMate site/BUSMATE DEV/busmate-frontend/src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  // replace \${ with ${
  content = content.replace(/\\\$\{/g, '${');
  // replace \` with `
  content = content.replace(/\\`/g, '`');
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Fixed escapes in pages.");
