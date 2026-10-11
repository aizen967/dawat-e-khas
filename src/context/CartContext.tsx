'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dish, CartItem } from '@/lib/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (dish: Dish) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dawat_cart');
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      // Ignore JSON error
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('dawat_cart', JSON.stringify(cart));
      } catch (e) {
        // Ignore storage error
      }
    }
  }, [cart, mounted]);

  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.dish.id !== dishId);
      }
      return prev.map((item) =>
        item.dish.id === dishId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
