const fs = require('fs');

const overviewPath = 'frontend/src/features/counsellor/psychologist-dashboard/tabs/OverviewTab.jsx';
let content = fs.readFileSync(overviewPath, 'utf8');

// Fix splitPercent undefined error
content = content.replace(
  /({splitPercent}% Split)/g,
  '({profile.commissionPercent !== undefined ? profile.commissionPercent : defaultSplit}% Split)'
);

// Remove razorpayAccountId display
const payoutAccountRegex = /<div className="flex justify-between font-bold text-zinc-400 items-center">[\s\S]*?<\/div>\s*<\/div>/;
const newPayoutUI = `<div className="flex justify-between font-bold text-zinc-400 items-center">
                  <span>Payout Mode</span>
                  <span className="text-zinc-500 font-medium text-xs">Internal (Manual)</span>
                </div>
              </div>`;

content = content.replace(payoutAccountRegex, newPayoutUI);

// Another fix for razorpay
content = content.replace(/profile\.razorpayAccountId \?/g, 'false ?');

fs.writeFileSync(overviewPath, content);
console.log("Patched OverviewTab.jsx");

const dashPath = 'frontend/src/features/counsellor/PsychologistDashboard.jsx';
let dashContent = fs.readFileSync(dashPath, 'utf8');

dashContent = dashContent.replace(
  /razorpayAccountId: c\.razorpayAccountId \|\| '',/g,
  'commissionPercent: c.commissionPercent,'
);
dashContent = dashContent.replace(
  /razorpayAccountId: formData\.razorpayAccountId \|\| '',/g,
  'commissionPercent: formData.commissionPercent,'
);
dashContent = dashContent.replace(
  /razorpayAccountId: '',/g,
  'commissionPercent: 50,'
);

fs.writeFileSync(dashPath, dashContent);
console.log("Patched dash");
