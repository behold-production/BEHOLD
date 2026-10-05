const fs = require('fs');
const cssPath = '/Users/abhijith/Documents/FREELANCE PROJECT/behold-aspire/frontend/src/features/landing/behold.css';
let css = fs.readFileSync(cssPath, 'utf8');

const overrides = `
/* Custom Behold Neon Blue Theme Overrides */
.behold-theme .hero {
  background: linear-gradient(105deg, #ffffff 36%, #f8fafc);
  padding: 80px 0;
}
.behold-theme h1 {
  font-size: 52px;
  letter-spacing: -1.2px;
}
.behold-theme .hero-copy .lead {
  font-size: 16px;
  line-height: 1.6;
  margin: 20px 0 30px;
}
.behold-theme .actions .pill {
  font-size: 14px;
  height: 48px;
  padding: 0 30px;
}
.behold-theme .btn-solid, .behold-theme .btn-outline {
  font-size: 14px;
  height: 44px;
}
.behold-theme .visual:before {
  background: var(--soft);
}
.behold-theme .feature-strip {
  padding: 40px 0;
  background: #fff;
  border-bottom: 1px solid var(--line);
}
.behold-theme .feature h3 {
  font-size: 16px;
  margin-top: 15px;
}
.behold-theme .feature p {
  font-size: 13px;
  color: var(--text);
}
.behold-theme .icon-circle {
  width: 54px;
  height: 54px;
  font-size: 20px;
}
.behold-theme .btn-outline {
  border-color: var(--primary2);
  color: var(--primary2);
}
.behold-theme .hero-trust span {
  font-size: 11px;
}
.behold-theme .doctor h3 {
  font-size: 15px;
}
.behold-theme .doctor p {
  font-size: 11px;
}
.behold-theme .doctor .card-btn {
  height: 34px;
  font-size: 11px;
}
.behold-theme .section-head h2 {
  font-size: 32px;
}
.behold-theme .section-head .lead {
  font-size: 14px;
}
`;

fs.writeFileSync(cssPath, css + overrides);
