const fs = require('fs');
const cssPath = '/Users/abhijith/Documents/FREELANCE PROJECT/behold-aspire/frontend/src/features/landing/behold.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Replace :root with .behold-theme variables
css = css.replace(/:root\s*\{[^}]+\}/, `
.behold-theme {
  --primary: #00e5ff;
  --primary2: #00b2be;
  --ink: #0f172a;
  --text: #334155;
  --muted: #64748b;
  --soft: #e0faff;
  --soft2: #f0fdff;
  --line: #e2e8f0;
  --green: #10b981;
  --orange: #f59e0b;
  --yellow: #fbbf24;
  --danger: #ef4444;
  --shadow: 0 10px 28px rgba(0,229,255,0.08);
}
`);

// Replace hardcoded purples
const colorMap = {
  '#5d43d4': 'var(--primary)',
  '#704fe0': 'var(--primary2)',
  '#f2efff': 'var(--soft)',
  '#f8f7ff': 'var(--soft2)',
  '#f0edff': 'var(--soft)',
  '#5747aa': '#0284c7', // tag color (dark cyan)
  'rgba(93,67,212,.18)': 'var(--shadow)', // btn-solid shadow
  '#9c91e2': 'var(--primary2)', // outline border
  '#332d77': '#0284c7', // outline text
  '#6047d7': 'var(--primary)', // logo heart
  '#735be2': 'var(--primary2)', // logo heart
  '#45436c': '#0284c7', // heart icon
  '#eeeaff': 'var(--soft)', // visual blob, cta bg
  '#e5ddff': 'var(--soft)', // cta bg
  '#3c32a0': '#0f172a', // cta heading
  '#b9afe9': 'var(--primary2)', // cta leaf
  '#f7f4ff': 'var(--soft2)', // next-card bg
  '#43359e': '#0f172a', // next-card heading
  '#e9e7f6': 'var(--soft)', // progress-ring
  '#4b3fc0': '#0f172a', // progress-ring
  '#5444a7': '#0284c7', // chip color
  '#735de0': 'var(--primary2)', // mode active border
  '#faf9ff': 'var(--soft2)', // mode active bg
  '#664bd9': 'var(--primary)', // solid button gradient (if it exists)
  '#755ce3': 'var(--primary2)', // solid button gradient (if it exists)
  'rgba(93,67,212,.18)': 'var(--shadow)'
};

for (const [oldColor, newColor] of Object.entries(colorMap)) {
  const regex = new RegExp(oldColor.replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\./g, '\\.'), 'gi');
  css = css.replace(regex, newColor);
}

// Ensure linear gradients that use hardcoded hex get replaced properly.
// Example: linear-gradient(105deg,#eeeaff,#e5ddff) => linear-gradient(105deg, var(--soft), var(--soft))
// Since we did string replacement above, they should already be replaced.

fs.writeFileSync(cssPath, css);
