'use client';

import React from 'react';
import BlogPostDetail from '../../../features/blog/BlogPostDetail';
import Navbar from '../../../components/common/Navbar';
import Footer from '../../../components/common/Footer';

export default function BlogDetailPage() {
  return (
    <>
      <Navbar currentView="/blog" />
      <BlogPostDetail />
      <Footer />
    </>
  );
}
