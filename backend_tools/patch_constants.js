const fs = require('fs');
const path = 'frontend/src/features/admin/admin-dashboard/adminDashboardConstants.js';
let content = fs.readFileSync(path, 'utf8');

const newModule = `
  {
    id: 'manage_blogs',
    name: 'Blog Management',
    actions: [
      { id: 'view_blogs', name: 'View Blogs' },
      { id: 'add_blogs', name: 'Add Blog' },
      { id: 'edit_blogs', name: 'Edit Blog' },
      { id: 'delete_blogs', name: 'Delete Blog' }
    ]
  }
`;

// Insert the new module before the closing bracket of the array
content = content.replace(/\];\s*$/, newModule + '];\n');
// Fix the comma
content = content.replace(/\}\s*\{\s*id: 'manage_blogs'/g, '},\n' + newModule.trim());

fs.writeFileSync(path, content);
console.log("Patched constants");
