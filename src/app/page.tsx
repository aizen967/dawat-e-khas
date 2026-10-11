'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { MenuSection } from '@/components/MenuSection';
import { OrderFormSection } from '@/components/OrderFormSection';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { OrderHistoryDrawer } from '@/components/OrderHistoryDrawer';
import { EmailTestModal } from '@/components/EmailTestModal';
import { Footer } from '@/components/Footer';
import { OrderResponse } from '@/lib/types';
import { MENU_ITEMS } from '@/data/menuData';
import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const { cart, addToCart, updateQuantity, clearCart } = useCart();
  const [orderSuccessResponse, setOrderSuccessResponse] = useState<OrderResponse | null>(null);
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickAddFeatured = () => {
    // Dish 2 is the Signature Peshawari Mutton Shinwari Karahi
    const signatureDish = MENU_ITEMS[1] || MENU_ITEMS[0];
    addToCart(signatureDish);
    scrollTo('order');
  };

  return (
    <main className="min-h-screen flex flex-col bg-stone-950 text-stone-100">
      
      {/* Navigation Header */}
      <Navbar onOpenConfigModal={() => setIsConfigModalOpen(true)} />

      {/* Hero Section (Featuring prominent restaurant name) */}
      <HeroSection
        onExploreMenu={() => scrollTo('menu')}
        onOrderNow={() => scrollTo('order')}
        onQuickAddFeatured={handleQuickAddFeatured}
      />

      {/* Handcrafted Pakistani Menu Section (9 dishes with picture, name, and PKR price) */}
      <MenuSection
        cart={cart}
        onAddToCart={addToCart}
        onUpdateQuantity={updateQuantity}
        onJumpToCheckout={() => scrollTo('order')}
      />

      {/* Order Form Section (Name, Phone, Address, Dishes & Quantities, Validation, Place Order) */}
      <OrderFormSection
        cart={cart}
        onAddToCart={addToCart}
        onUpdateQuantity={updateQuantity}
        onClearCart={clearCart}
        onOrderSuccess={(response) => setOrderSuccessResponse(response)}
      />

      {/* Footer with Pakistani restaurant details */}
      <Footer />

      {/* Order Placement Success Modal */}
      <OrderSuccessModal
        orderResponse={orderSuccessResponse}
        onClose={() => setOrderSuccessResponse(null)}
        onViewOrders={() => {
          setOrderSuccessResponse(null);
          setIsOrdersDrawerOpen(true);
        }}
      />

      {/* Live Supabase Orders Drawer */}
      <OrderHistoryDrawer
        isOpen={isOrdersDrawerOpen}
        onClose={() => setIsOrdersDrawerOpen(false)}
      />

      {/* Integrations & Diagnostics Modal */}
      <EmailTestModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />

    </main>
  );
}
