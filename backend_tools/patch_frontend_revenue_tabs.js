const fs = require('fs');

const overviewTabPath = 'frontend/src/features/counsellor/psychologist-dashboard/tabs/OverviewTab.jsx';
let overviewContent = fs.readFileSync(overviewTabPath, 'utf8');

overviewContent = overviewContent.replace(
  'Total completed sessions payouts.',
  'Earnings recorded for end-of-month manual payout.'
);
fs.writeFileSync(overviewTabPath, overviewContent);
console.log("Patched OverviewTab.jsx");


const revenueTabPath = 'frontend/src/features/counsellor/psychologist-dashboard/tabs/RevenueTab.jsx';
let revenueContent = fs.readFileSync(revenueTabPath, 'utf8');

revenueContent = revenueContent.replace(
  'Total earnings from all your sessions on BEHOLD Aspire platform.',
  'Total earnings accumulated for the end-of-month manual payout based on your commission split.'
);
fs.writeFileSync(revenueTabPath, revenueContent);
console.log("Patched RevenueTab.jsx");
