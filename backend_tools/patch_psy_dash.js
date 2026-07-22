const fs = require('fs');

const path = 'frontend/src/features/counsellor/PsychologistDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/razorpayAccountId: c\.razorpayAccountId \|\| '',/g, '');
content = content.replace(/razorpayAccountId: formData\.razorpayAccountId \|\| '',/g, '');
content = content.replace(/razorpayAccountId: '',/g, '');

fs.writeFileSync(path, content);
console.log("Patched PsychologistDashboard.jsx");
