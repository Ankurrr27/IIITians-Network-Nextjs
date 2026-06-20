const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('src/app');
let changed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace common variants of h1 with the standard
  content = content.replace(/<h1\s+className="([^"]*)"/g, (match, p1) => {
    // Keep layout classes like mt-, mb-, max-w, text-center
    const keepClasses = p1.split(' ').filter(c => 
      c.startsWith('mt-') || 
      c.startsWith('mb-') || 
      c.startsWith('text-center') || 
      c.startsWith('max-w-') || 
      c.includes('isDarkMode')
    ).join(' ');
    
    // The standard core classes
    const standard = 'text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl';
    
    const combined = (keepClasses + ' ' + standard).trim();
    return `<h1 className="${combined}"`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
    changed++;
  }
}
console.log('Total files changed:', changed);
