'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ServiceBooking from '../../features/booking/ServiceBooking';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function BookingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar currentView="/booking" />
      <ServiceBooking
        isOpen={true}
        onClose={() => router.push('/')}
      />
      <Footer />
    </div>
  );
}
