'use client';

import React from 'react';
import StudentProfile from '../../features/student/components/profile/StudentProfile';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#faf6ee] flex flex-col justify-between">
      <Navbar currentView="/profile" />
      <StudentProfile />
      <Footer />
    </div>
  );
}
