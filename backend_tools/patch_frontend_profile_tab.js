const fs = require('fs');

const profileTabPath = 'frontend/src/features/counsellor/psychologist-dashboard/tabs/ProfileTab.jsx';
let content = fs.readFileSync(profileTabPath, 'utf8');

// The field looks like:
/*
                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-bold text-zinc-400 block mb-1">
                    Razorpay Linked Account ID (for split payouts)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. acc_N1z829Snd023"
                    value={ep.razorpayAccountId || ''}
                    onChange={(e) => setEp({ razorpayAccountId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all font-semibold"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Required to receive direct split payouts. Create a linked account in your Razorpay Dashboard.
                  </p>
                </div>
*/

// Let's use a regex to match and remove this section.
const regex = /<div[^>]*>\s*<label[^>]*>\s*Razorpay Linked Account ID[\s\S]*?<\/p>\s*<\/div>/g;

content = content.replace(regex, '');

fs.writeFileSync(profileTabPath, content);
console.log("Patched ProfileTab.jsx");
