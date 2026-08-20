'use client';

import React from 'react';
import StudentProfile from '../../features/student/components/profile/StudentProfile';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar currentView="/profile" />
      <StudentProfile />
      <Footer />
    </div>
  );
}
