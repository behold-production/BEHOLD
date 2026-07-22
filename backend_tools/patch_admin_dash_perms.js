const fs = require('fs');
const dashPath = 'frontend/src/features/admin/AdminDashboard.jsx';
let dashContent = fs.readFileSync(dashPath, 'utf8');

// Insert hasBlogPermission after hasFaqPermission
dashContent = dashContent.replace(
  /const hasFaqPermission = .*?;/g,
  `$&
  const hasBlogPermission = isSuperAdmin || _p.includes('manage_blogs') || ['view_blogs','add_blogs','edit_blogs','delete_blogs'].some(k => _p.includes(k));`
);

// Update tab rendering for blogs
dashContent = dashContent.replace(
  /\{currentSection === 'blogs' && <BlogManagementTab \/>\}/g,
  `{currentSection === 'blogs' && hasBlogPermission && <BlogManagementTab />}`
);

fs.writeFileSync(dashPath, dashContent);
console.log("Patched AdminDashboard.jsx");
