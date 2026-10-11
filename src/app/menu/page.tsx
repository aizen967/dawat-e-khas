'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { MenuSection } from '@/components/MenuSection';
import { Footer } from '@/components/Footer';
import { EmailTestModal } from '@/components/EmailTestModal';

export default function MenuPage() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-stone-950 text-stone-100">
      <Navbar onOpenConfigModal={() => setIsConfigModalOpen(true)} />
      <MenuSection isStandalonePage={true} />
      <Footer />
      <EmailTestModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </main>
  );
}
