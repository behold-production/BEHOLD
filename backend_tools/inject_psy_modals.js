const fs = require('fs');
let content = fs.readFileSync('frontend/src/features/admin/admin-dashboard/tabs/PsychologistManagementTab.jsx', 'utf8');

const add_modal = fs.readFileSync('/tmp/psy_add_modal.jsx', 'utf8');
const view_modal = fs.readFileSync('/tmp/psy_view_modal.jsx', 'utf8');

// Insert the modals right before the final </>
const target = "</>\n  );\n}";
const replacement = `\n${add_modal}\n\n${view_modal}\n${target}`;

content = content.replace(target, replacement);

fs.writeFileSync('frontend/src/features/admin/admin-dashboard/tabs/PsychologistManagementTab.jsx', content);
