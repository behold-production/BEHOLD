/**
 * Utility functions for text formatting and image resolution
 */

/**
 * Ensures a relative image path (like 'uploads/xyz.jpg') is converted 
 * to an absolute URL pointing to the API backend.
 * 
 * @param {string} path - The image path
 * @returns {string} - The fully resolved URL
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  // If it's already an absolute URL (http:// or https:// or data:image), return as is
  if (/^(https?:\/\/|data:image)/.test(path)) {
    return path;
  }
  
  // Clean up leading slashes to prevent double slashes
  const cleanPath = path.replace(/^[/\\]+/, '');
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  
  return `${baseUrl}/${cleanPath}`;
};

/**
 * Formats plain text content into HTML paragraphs if it doesn't already contain HTML tags.
 * Helps format admin blog posts that were typed in a plain textarea.
 * 
 * @param {string} content - The blog content
 * @returns {string} - Formatted HTML
 */
export const formatBlogContent = (content) => {
  if (!content) return '';
  
  // Basic heuristic to check if the content already contains HTML tags (like <p>, <br>, <h2>)
  // We ignore self-closing simple tags just in case, but typically rich HTML has opening/closing tags.
  if (/<[a-z][\s\S]*>/i.test(content)) {
    // Also, if the content contains images with relative paths (e.g. src="uploads/..."),
    // we need to resolve them so they don't break on sub-routes like /blog/:slug
    return content.replace(/<img\s+([^>]*?)src=["'](?!http|data:)(.*?)["']([^>]*)>/gi, (match, before, src, after) => {
      const resolvedSrc = getImageUrl(src);
      return `<img ${before}src="${resolvedSrc}"${after}>`;
    });
  }
  // Handle plain text:
  // 1. Split by double newlines to create paragraphs
  // 2. Replace single newlines within paragraphs with <br/>
  return content
    .split(/\n\s*\n/)
    .map(paragraph => {
      if (!paragraph.trim()) return '';
      return `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');
};

/**
 * Formats psychologist experience into Consultation Hours
 * Handles numeric values, strings like "1500 hrs", or legacy hour/year numbers
 */
export const formatExperience = (expInput) => {
  if (!expInput && expInput !== 0) {
    return {
      hours: '900+ Hours Consulted',
      rawHours: 900,
      years: '900+ Hours Consulted',
      rawYears: 900
    };
  }

  const str = String(expInput).trim();
  const numMatch = str.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0], 10) : 900;

  // Convert legacy year inputs (< 50) into hours (3 -> 900 hours, 5 -> 1500 hours)
  const hours = num < 50 ? num * 300 : num;
  return {
    hours: `${hours.toLocaleString()}+ Hours Consulted`,
    rawHours: hours,
    years: `${hours.toLocaleString()}+ Hours Consulted`,
    rawYears: hours
  };
};
