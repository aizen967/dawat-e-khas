'use client';

import React from 'react';
import { CartProvider } from '@/context/CartContext';
import { RoleSelectModal } from '@/components/RoleSelectModal';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CartProvider>
      <RoleSelectModal />
      {children}
    </CartProvider>
  );
};
