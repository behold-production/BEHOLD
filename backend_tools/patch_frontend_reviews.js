const fs = require('fs');

const reviewsPath = 'frontend/src/features/landing/Reviews.jsx';
let content = fs.readFileSync(reviewsPath, 'utf8');

// The unauthenticated state currently looks like:
/*
  if (!user) {
    return (
      <div className="text-center py-10 bg-gray-50 border border-gray-100 rounded-lg">
        <p className="text-gray-600 text-sm mb-4 font-medium">You must be logged in to leave a review.</p>
        <a href="/login" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded hover:bg-black transition">
          Login / Register
        </a>
      </div>
    );
  }
*/

const oldAuthUI = `  if (!user) {
    return (
      <div className="text-center py-10 bg-gray-50 border border-gray-100 rounded-lg">
        <p className="text-gray-600 text-sm mb-4 font-medium">You must be logged in to leave a review.</p>
        <a href="/login" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded hover:bg-black transition">
          Login / Register
        </a>
      </div>
    );
  }`;

const newAuthUI = `  if (!user) {
    return (
      <div className="text-center py-12 bg-white border border-gray-200 border-dashed rounded-xl shadow-sm flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h4 className="text-lg font-bold text-gray-900 font-serif mb-2">Login Required</h4>
        <p className="text-gray-500 text-sm mb-6 max-w-xs font-medium leading-relaxed">
          You must be logged in to share your experience with the BEHOLD community.
        </p>
        <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold text-sm rounded-full hover:bg-black hover:shadow-lg transition-all transform hover:-translate-y-0.5">
          Login or Register
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    );
  }`;

content = content.replace(oldAuthUI, newAuthUI);

// Improve submitted state UI
const oldSubmitUI = `  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
          ✓
        </div>
        <p className="font-bold text-gray-900 text-base">Thank you for your review!</p>
        <p className="text-gray-500 text-xs mt-1">It will appear once approved.</p>
      </div>
    );
  }`;

const newSubmitUI = `  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="font-bold text-gray-900 text-xl font-serif mb-2">Thank you!</h4>
        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
          Your review has been successfully submitted and is currently pending admin approval.
        </p>
      </div>
    );
  }`;

content = content.replace(oldSubmitUI, newSubmitUI);

// Polish submit form fields UI
content = content.replace(/className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition/g, 'className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-900 transition shadow-sm hover:border-gray-300');

fs.writeFileSync(reviewsPath, content);
console.log("Patched Reviews.jsx");
