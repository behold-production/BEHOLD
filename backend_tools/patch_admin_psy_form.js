const fs = require('fs');

const adminDashboardPath = 'frontend/src/features/admin/AdminDashboard.jsx';
let content = fs.readFileSync(adminDashboardPath, 'utf8');

// Add commissionPercent to handleOpenEditPsy
content = content.replace(
  "price: psy.price || 1200,",
  "price: psy.price || 1200,\n      commissionPercent: psy.commissionPercent !== undefined ? psy.commissionPercent : 50,"
);

// Add commissionPercent to handleOpenAddPsy (if it resets the form)
const handleOpenAddPsyRegex = /const handleOpenAddPsy = \(\) => {[\s\S]*?setPsyForm\(\{([\s\S]*?)\}\);/g;
content = content.replace(handleOpenAddPsyRegex, (match, formContent) => {
    if (!formContent.includes('commissionPercent')) {
        return match.replace("price: 1200,", "price: 1200,\n      commissionPercent: 50,");
    }
    return match;
});

fs.writeFileSync(adminDashboardPath, content);
console.log("Patched AdminDashboard.jsx");
