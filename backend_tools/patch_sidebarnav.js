const fs = require('fs');
const navPath = 'frontend/src/features/admin/admin-dashboard/tabs/SidebarNav.jsx';
let navContent = fs.readFileSync(navPath, 'utf8');

// Update the visible property for blogs
// It currently looks like: { id: 'blogs', label: 'Blog Manager', icon: FileText, visible: true },
navContent = navContent.replace(
  /\{ id: 'blogs', label: 'Blog Manager', icon: FileText, visible: true \},/g,
  `{ id: 'blogs', label: 'Blog Manager', icon: FileText, visible: isSuperAdmin || props.hasBlogPermission },`
);

fs.writeFileSync(navPath, navContent);
console.log("Patched SidebarNav.jsx");
