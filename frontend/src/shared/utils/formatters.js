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
  const cleanPath = path.replace(/^[\/\\]+/, '');
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
    return content;
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
