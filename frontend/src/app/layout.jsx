import '../index.css';
import Providers from './Providers';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  metadataBase: new URL('https://www.behold.co.in'),
  title: {
    default: 'BEHOLD | Professional Online Therapy & Psychological Counselling',
    template: '%s | BEHOLD',
  },
  description:
    'A safe space for psychological counselling and mental wellbeing. Professional online therapy that helps you better understand yourself, navigate challenges, and grow with confidence.',
  keywords: [
    'BEHOLD',
    'online therapy',
    'psychological counselling',
    'mental wellbeing',
    'clinical psychologist',
    'career mentoring',
    'CDAT aptitude assessment',
  ],
  authors: [{ name: 'BEHOLD Team', url: 'https://www.behold.co.in' }],
  creator: 'BEHOLD',
  publisher: 'BEHOLD',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.behold.co.in',
    siteName: 'BEHOLD',
    title: 'BEHOLD | Professional Online Therapy & Psychological Counselling',
    description:
      'A safe space for psychological counselling and mental wellbeing. Professional online therapy that helps you better understand yourself, navigate challenges, and grow with confidence.',
    images: [
      {
        url: 'https://www.behold.co.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BEHOLD Mental Wellbeing & Counselling',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BEHOLD | Professional Online Therapy & Psychological Counselling',
    description:
      'A safe space for psychological counselling and mental wellbeing. Professional online therapy.',
    images: ['https://www.behold.co.in/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Caveat:wght@400..700&family=Cinzel:wght@400..900&family=Climate+Crisis&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600;1,700&family=Dancing+Script:wght@400..700&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700&family=Syne:wght@400..800&family=Outfit:wght@300..900&display=swap"
          rel="stylesheet"
        />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="bg-slate-50 antialiased font-sans text-slate-800 selection:bg-[#00c9d6] selection:text-slate-950">
        <Providers>
          <Toaster position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
