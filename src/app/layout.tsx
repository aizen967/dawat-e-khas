import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Dawat-e-Khas Royal Pakistani Cuisine | Authentic Desi Dining & Online Delivery',
  description: 'Experience authentic Pakistani cuisine. Order Karachi Chicken Dum Biryani, Shinwari Mutton Karahi, Shahi Nalli Nihari, Seekh Kebabs, and Roghani Naan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-100 selection:text-amber-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
