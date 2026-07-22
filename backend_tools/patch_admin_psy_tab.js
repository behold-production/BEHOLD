const fs = require('fs');

const tabPath = 'frontend/src/features/admin/admin-dashboard/tabs/PsychologistManagementTab.jsx';
let content = fs.readFileSync(tabPath, 'utf8');

// Insert the commissionPercent input field next to the hourly price (INR).
const commissionField = `
                <div className="space-y-1">
                  <label className="text-sm font-bold text-zinc-400">
                    Commission Split (%)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={psyForm.commissionPercent ?? 50}
                    onChange={(e) =>
                      setPsyForm({ ...psyForm, commissionPercent: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>
`;

// Find where "Hourly price (INR)" is located
const priceFieldRegex = /<div className="space-y-1">\s*<label className="text-sm font-bold text-zinc-400">\s*Hourly price \(INR\)\s*<\/label>[\s\S]*?<\/div>/;

if (priceFieldRegex.test(content)) {
    content = content.replace(priceFieldRegex, (match) => {
        return match + '\n' + commissionField;
    });
    fs.writeFileSync(tabPath, content);
    console.log("Patched PsychologistManagementTab.jsx");
} else {
    console.error("Could not find Hourly price (INR) field in PsychologistManagementTab.jsx");
}

