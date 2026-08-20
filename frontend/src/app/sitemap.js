const BASE_URL = 'https://www.behold.co.in';

export default async function sitemap() {
  let dynamicBlogs = [];
  let dynamicAdvisors = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.behold.co.in';
    const [blogsRes, counsellorsRes] = await Promise.allSettled([
      fetch(`${apiUrl}/api/blogs?status=published`, { next: { revalidate: 3600 } }).then(r => r.json()),
      fetch(`${apiUrl}/api/counsellors`, { next: { revalidate: 3600 } }).then(r => r.json())
    ]);

    if (blogsRes.status === 'fulfilled' && blogsRes.value?.data && Array.isArray(blogsRes.value.data)) {
      dynamicBlogs = blogsRes.value.data.map((b) => ({
        url: `${BASE_URL}/blog/${b.slug}`,
        lastModified: new Date(b.updatedAt || b.createdAt || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }

    if (counsellorsRes.status === 'fulfilled' && counsellorsRes.value?.data && Array.isArray(counsellorsRes.value.data)) {
      dynamicAdvisors = counsellorsRes.value.data.map((c) => ({
        url: `${BASE_URL}/advisor/${c.id || c._id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.warn('Dynamic sitemap fetch error:', e);
  }

  const staticRoutes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/faqs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/booking`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/aptitude`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/sample-test`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticRoutes, ...dynamicBlogs, ...dynamicAdvisors];
}
