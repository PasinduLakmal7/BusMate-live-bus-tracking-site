const fs = require('fs');
const path = require('path');

const directories = [
  'src/components/common',
  'src/pages',
  'src/components/layout'
];

const classMap = {
  'bg-white': 'bg-white dark:bg-gray-800',
  'text-gray-900': 'text-gray-900 dark:text-gray-50',
  'text-gray-800': 'text-gray-800 dark:text-gray-200',
  'text-gray-700': 'text-gray-700 dark:text-gray-300',
  'text-gray-600': 'text-gray-600 dark:text-gray-400',
  'text-gray-500': 'text-gray-500 dark:text-gray-400',
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-900',
  'bg-gray-100': 'bg-gray-100 dark:bg-gray-700',
  'bg-gray-200': 'bg-gray-200 dark:bg-gray-700',
  'border-gray-50': 'border-gray-50 dark:border-gray-800',
  'border-gray-100': 'border-gray-100 dark:border-gray-700',
  'border-gray-200': 'border-gray-200 dark:border-gray-600',
  'border-gray-300': 'border-gray-300 dark:border-gray-500'
};

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.jsx')) {
      callback(path.join(dirPath));
    }
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [light, darkStr] of Object.entries(classMap)) {
    // Regex matches the light class that is bounded by whitespace/quotes/backticks
    // and ensures we don't duplicate if dark: is already nearby for the same property type.
    // A simpler approach: replace it, then we will run a cleanup pass for duplicates.
    
    // Lookahead for boundaries
    const regex = new RegExp(`(?<=[\\s'"\`{}])${light}(?=[\\s'"\`{}])`, 'g');
    content = content.replace(regex, darkStr);
  }
  
  // Clean up any potential duplicates if the file already had dark: classes.
  // E.g. "bg-white dark:bg-gray-800 dark:bg-gray-900" -> this is hard to clean with regex.
  // Instead, since most files don't have dark mode classes yet except Navbar, we can just replace safely.
  // Wait, let's fix any double darks.
  content = content.replace(/dark:bg-gray-800\s+dark:bg-gray-[0-9]+/g, 'dark:bg-gray-800');
  content = content.replace(/dark:text-gray-50\s+dark:text-white/g, 'dark:text-white');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  walkDir(fullPath, processFile);
});

console.log('Dark mode classes applied.');
