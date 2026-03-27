const fs = require('fs');
const path = require('path');
const pagesDir = 'e:/Semester 3/Web develepment/BusMate site/BUSMATE DEV/busmate-frontend/src/pages';
fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.jsx')) {
    let p = path.join(pagesDir, file);
    let c = fs.readFileSync(p, 'utf8');
    let orig = c;

    // Replace restrictive max-widths with the 80% viewport standard max-w-7xl
    c = c.replace(/max-w-4xl/g, 'max-w-7xl');
    c = c.replace(/max-w-5xl/g, 'max-w-7xl');

    if (c !== orig) {
      fs.writeFileSync(p, c, 'utf8');
      console.log('Expanded width for ' + file);
    }
  }
});
