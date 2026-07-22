const fs = require('fs');

let content = fs.readFileSync('frontend/src/features/admin/admin-dashboard/tabs/PsychologistManagementTab.jsx', 'utf8');

const add_modal = fs.readFileSync('/tmp/psy_add_modal.jsx', 'utf8');
const view_modal = fs.readFileSync('/tmp/psy_view_modal.jsx', 'utf8');

// The file might contain multiple copies of add_modal and view_modal.
// Let's strip ALL of them, and then re-inject them ONCE.
const add_str = add_modal.trim();
const view_str = view_modal.trim();

content = content.split(add_str).join('');
content = content.split(view_str).join('');

// Clean up extra blank lines at the end
content = content.replace(/(\s*<\/>\s*\);\s*}\s*)$/, "\n</>\n  );\n}");

// Re-inject once
const target = "</>\n  );\n}";
const replacement = `\n${add_str}\n\n${view_str}\n\n${target}`;
content = content.replace(target, replacement);

fs.writeFileSync('frontend/src/features/admin/admin-dashboard/tabs/PsychologistManagementTab.jsx', content);
