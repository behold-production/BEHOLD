const fs = require('fs');
const dashPath = 'frontend/src/features/admin/AdminDashboard.jsx';
let dashContent = fs.readFileSync(dashPath, 'utf8');

dashContent = dashContent.replace(
  /const tabProps = \{/,
  `const tabProps = {\n  hasBlogPermission,\n`
);

fs.writeFileSync(dashPath, dashContent);
console.log("Patched tabProps");
