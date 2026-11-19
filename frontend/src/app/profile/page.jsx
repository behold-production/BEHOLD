'use client';

import React from 'react';
import UserProfile from '../../features/user/components/profile/UserProfile';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f6f1e6] flex flex-col justify-between">
      <Navbar currentView="/profile" />
      <UserProfile />
      <Footer />
    </div>
  );
}
