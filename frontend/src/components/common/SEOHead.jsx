import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'BEHOLD';
const DEFAULT_TITLE = 'BEHOLD | Professional Online Therapy & Psychological Counselling';
const DEFAULT_DESCRIPTION = 'A safe space for psychological counselling and mental wellbeing. Professional online therapy that helps you better understand yourself, navigate challenges, and grow with confidence.';
const DEFAULT_KEYWORDS = 'BEHOLD, professional online therapy, psychological counselling, mental wellbeing, online therapy, clinical psychologist, mental health counselling, psychological consultation, online psychologist';
const DEFAULT_OG_IMAGE = 'https://www.behold.co.in/og-image.png';
const BASE_URL = 'https://www.behold.co.in';

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author,
  noIndex = false,
  structuredData
}) {
  const pageTitle = title ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`) : DEFAULT_TITLE;
  const canonical = canonicalUrl ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${BASE_URL}${canonicalUrl.startsWith('/') ? '' : '/'}${canonicalUrl}`) : BASE_URL;

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Robots indexing directive */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={pageTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={pageTitle} />

      {/* Article specific metadata if present */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
