const fs = require('fs');

const inputCss = fs.readFileSync('/Users/abhijith/Documents/FREELANCE PROJECT/behold-aspire/MindCare_Complete_Full_Code 2/styles.css', 'utf8');

function prefixCSS(css, prefix) {
  let output = '';
  let i = 0;
  
  while (i < css.length) {
    // skip whitespace
    while (i < css.length && /\s/.test(css[i])) {
      output += css[i];
      i++;
    }
    if (i >= css.length) break;

    // if at-rule
    if (css[i] === '@') {
      let atRule = '';
      while (i < css.length && css[i] !== '{' && css[i] !== ';') {
        atRule += css[i];
        i++;
      }
      output += atRule;
      if (css[i] === ';') {
        output += ';';
        i++;
        continue;
      }
      
      // if it's media query, we just copy the '{' and then process the inside
      if (atRule.includes('@media')) {
        output += '{';
        i++;
        continue;
      } else {
        // keyframes or other block, copy the whole block without prefixing
        output += '{';
        i++;
        let depth = 1;
        while (i < css.length && depth > 0) {
          output += css[i];
          if (css[i] === '{') depth++;
          if (css[i] === '}') depth--;
          i++;
        }
        continue;
      }
    }

    // if closing brace from a media query
    if (css[i] === '}') {
      output += '}';
      i++;
      continue;
    }

    // parse selector
    let selector = '';
    while (i < css.length && css[i] !== '{') {
      selector += css[i];
      i++;
    }
    
    if (i >= css.length) break;
    
    // prefix selector
    let prefixed = selector.split(',').map(s => {
      let t = s.trim();
      if (!t || t.startsWith(':root') || t.startsWith('--')) return s;
      return prefix + ' ' + t;
    }).join(',');
    
    output += prefixed + '{';
    i++;
    
    // parse rule body
    while (i < css.length && css[i] !== '}') {
      output += css[i];
      i++;
    }
    
    output += '}';
    i++;
  }
  
  return output;
}

const result = prefixCSS(inputCss, '.behold-theme');
fs.writeFileSync('/Users/abhijith/Documents/FREELANCE PROJECT/behold-aspire/frontend/src/features/landing/mindcare.css', result);
