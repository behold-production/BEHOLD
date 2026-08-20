'use client';

import React from 'react';
import BlogList from '../../features/blog/BlogList';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function BlogPage() {
  return (
    <>
      <Navbar currentView="/blog" />
      <BlogList />
      <Footer />
    </>
  );
}
