'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { OrderFormSection } from '@/components/OrderFormSection';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { Footer } from '@/components/Footer';
import { EmailTestModal } from '@/components/EmailTestModal';
import { OrderResponse } from '@/lib/types';

export default function OrderPage() {
  const router = useRouter();
  const [orderSuccessResponse, setOrderSuccessResponse] = useState<OrderResponse | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-stone-950 text-stone-100">
      <Navbar onOpenConfigModal={() => setIsConfigModalOpen(true)} />

      <OrderFormSection
        isStandalonePage={true}
        onOrderSuccess={(response) => setOrderSuccessResponse(response)}
      />

      <Footer />

      {/* Order Placement Success Modal */}
      <OrderSuccessModal
        orderResponse={orderSuccessResponse}
        onClose={() => setOrderSuccessResponse(null)}
        onViewOrders={() => {
          setOrderSuccessResponse(null);
          router.push('/orders');
        }}
      />

      {/* Diagnostics Modal */}
      <EmailTestModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </main>
  );
}
