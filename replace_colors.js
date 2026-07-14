const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  if (file.endsWith('index.css')) {
    content = content.replace(/--color-green-deep: #1F3B32;/g, '--color-neon-blue-deep: #060e20;');
    content = content.replace(/--color-green-mid: #2E5347;/g, '--color-neon-blue-mid: #0c1a36;');
    content = content.replace(/--color-green-soft: #3C6558;/g, '--color-neon-blue-soft: #152b52;');
  } else {
    content = content.replace(/green-deep/g, 'neon-blue-deep');
    content = content.replace(/green-mid/g, 'neon-blue-mid');
    content = content.replace(/green-soft/g, 'neon-blue-soft');
    content = content.replace(/doc\.setTextColor\(22, 163, 74\); \/\/ green/g, 'doc.setTextColor(0, 229, 255); // neon blue');
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
