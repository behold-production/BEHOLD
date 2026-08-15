// Vercel Serverless Function to serve dynamic meta tags for social bots
// Endpoint: /api/seo?path=/blog/some-slug
export default async function handler(req, res) {
  const { path } = req.query;
  
  // Default values
  let title = "BEHOLD. | Professional Online Therapy & Psychological Counselling";
  let description = "A safe space for psychological counselling and mental wellbeing. Professional online therapy that helps you better understand yourself, navigate challenges, and grow with confidence.";
  let image = "https://www.behold.co.in/favicon.svg";

  try {
    const apiUrl = process.env.VITE_API_URL || 'https://api.behold.co.in'; // Fallback
    
    // Check if it's a blog post
    if (path && path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '').split('/')[0];
      if (slug) {
        const fetchRes = await fetch(`${apiUrl}/api/public/blogs?slug=${slug}`);
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          if (data && data.success && data.data && data.data.length > 0) {
            const blog = data.data[0];
            title = `${blog.title} | BEHOLD.`;
            description = blog.excerpt || description;
            if (blog.coverImage) image = blog.coverImage;
          }
        }
      }
    } 
    // Check if it's an advisor profile
    else if (path && path.startsWith('/advisor/')) {
      const id = path.replace('/advisor/', '').split('/')[0];
      if (id) {
        const fetchRes = await fetch(`${apiUrl}/api/public/counsellors/${id}`);
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          if (data && data.success && data.data) {
            const advisor = data.data;
            title = `${advisor.name} | BEHOLD.`;
            description = `Book a session with ${advisor.name}, ${advisor.role || 'Psychologist'}.`;
            if (advisor.profilePic) image = advisor.profilePic;
          }
        }
      }
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:type" content="website" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content="${title}" />
  <meta property="twitter:description" content="${description}" />
  <meta property="twitter:image" content="${image}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <!-- Social bots don't need JS, they just read the head -->
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=86400');
    return res.status(200).send(html);
  } catch (error) {
    console.error('SEO Proxy Error:', error);
    // Return basic fallback
    return res.status(200).send(`<!DOCTYPE html><html><head><title>${title}</title></head><body></body></html>`);
  }
}
