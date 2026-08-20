'use client';

import React from 'react';
import AptitudeLanding from '../../features/student/components/aptitude/AptitudeLanding';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function AptitudePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar currentView="/aptitude" />
      <AptitudeLanding />
      <Footer />
    </div>
  );
}
