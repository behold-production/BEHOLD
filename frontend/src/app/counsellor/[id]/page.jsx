'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdvisorProfile from '../../../features/counsellor/AdvisorProfile';
import Navbar from '../../../components/common/Navbar';
import Footer from '../../../components/common/Footer';

export default function CounsellorProfilePage() {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <Navbar currentView="/counsellor" />
      <AdvisorProfile
        advisorId={params?.id}
        onBack={() => router.push('/')}
        onBook={() => router.push('/booking')}
      />
      <Footer />
    </>
  );
}
