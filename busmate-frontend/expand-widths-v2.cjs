const fs = require('fs');
const path = require('path');

const dirs = [
  'src/components/common',
  'src/pages',
  'src/components/layout'
];

function processFile(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  let orig = c;
  
  // Tailwind's max-w-7xl is hardcapped at 1280px. We replace it with relative bounds
  // so that on a 1920px screen it will physically take up 80% of the screen.
  c = c.replace(/max-w-7xl/g, 'max-w-[90%] 2xl:max-w-[80%]');
  
  if (c !== orig) {
    fs.writeFileSync(filePath, c, 'utf8');
    console.log('Expanded to dynamic widths: ' + path.basename(filePath));
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walkDir(p);
    else if (f.endsWith('.jsx')) processFile(p);
  });
}

dirs.forEach(d => walkDir(path.join(__dirname, d)));
