export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/admin-login', '/counsellor/dashboard', '/profile', '/api/'],
      },
    ],
    sitemap: 'https://www.behold.co.in/sitemap.xml',
  };
}
