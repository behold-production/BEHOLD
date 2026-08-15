export const config = {
  matcher: ['/blog/:path*', '/advisor/:path*'],
};

export default function middleware(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Identify common social media and messaging bots (but exclude Googlebot so it gets the real React app)
  const isBot = /facebookexternalhit|whatsapp|twitterbot|linkedinbot|slackbot|telegrambot|discordbot/i.test(userAgent) && !/googlebot/i.test(userAgent);

  if (isBot) {
    // Route to our dynamic SEO serverless function
    url.pathname = '/api/seo';
    url.searchParams.set('path', request.url);
    
    // Rewrite the response from the serverless function
    // For Vercel Edge middleware, fetch is supported and can be returned as the response
    return fetch(url.toString(), {
      headers: request.headers
    });
  }

  // Allow normal users and Googlebot to load the React app
  return;
}
