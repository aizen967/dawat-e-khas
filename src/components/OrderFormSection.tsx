'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Dish, CartItem, OrderResponse } from '@/lib/types';
import { MENU_ITEMS } from '@/data/menuData';
import { useCart } from '@/context/CartContext';
import { formatPKR } from '@/lib/currency';
import {
  User,
  Phone,
  MapPin,
  Mail,
  FileText,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  Loader2,
  Database,
  Send,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

interface OrderFormSectionProps {
  cart?: CartItem[];
  onAddToCart?: (dish: Dish) => void;
  onUpdateQuantity?: (dishId: string, quantity: number) => void;
  onClearCart?: () => void;
  onOrderSuccess: (orderResponse: OrderResponse) => void;
  isStandalonePage?: boolean;
}

export const OrderFormSection: React.FC<OrderFormSectionProps> = ({
  cart: propCart,
  onAddToCart: propAddToCart,
  onUpdateQuantity: propUpdateQuantity,
  onClearCart: propClearCart,
  onOrderSuccess,
  isStandalonePage = false,
}) => {
  const globalCart = useCart();
  const cart = propCart ?? globalCart.cart;
  const onAddToCart = propAddToCart ?? globalCart.addToCart;
  const onUpdateQuantity = propUpdateQuantity ?? globalCart.updateQuantity;
  const onClearCart = propClearCart ?? globalCart.clearCart;

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
    items?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cart calculations in PKR
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const deliveryFee = 0; // Free delivery in Lahore / Karachi promo
  const grandTotal = subtotal + deliveryFee;

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      phone?: string;
      address?: string;
      items?: string;
    } = {};

    if (!customerName.trim()) {
      newErrors.name = 'Customer name is required.';
    } else if (customerName.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!customerPhone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (customerPhone.trim().length < 7) {
      newErrors.phone = 'Please enter a valid phone number (e.g. 0300-1234567).';
    }

    if (!customerAddress.trim()) {
      newErrors.address = 'Delivery address is required.';
    } else if (customerAddress.trim().length < 5) {
      newErrors.address = 'Please provide a complete street/house address.';
    }

    if (cart.length === 0 || totalItemsCount === 0) {
      newErrors.items = 'Please select at least one Pakistani dish before placing your order.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          address: customerAddress.trim(),
          email: customerEmail.trim() || undefined,
          specialInstructions: specialNotes.trim() || undefined,
        },
        items: cart.map((item) => ({
          dishId: item.dish.id,
          name: item.dish.name,
          price: item.dish.price,
          quantity: item.quantity,
          itemTotal: Math.round(item.dish.price * item.quantity),
        })),
        totalPrice: grandTotal,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order.');
      }

      // Success
      if (data.order) {
        try {
          const cached = JSON.parse(localStorage.getItem('dawat_cached_orders') || '[]');
          cached.unshift(data.order);
          localStorage.setItem('dawat_cached_orders', JSON.stringify(cached));
        } catch (e) {}
      }

      onOrderSuccess(data);
      onClearCart();
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerEmail('');
      setSpecialNotes('');
      setErrors({});
    } catch (err: any) {
      console.error('Order submission error:', err);
      setSubmitError(err.message || 'An error occurred while placing the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order" className={`py-16 sm:py-20 bg-stone-900 text-stone-100 scroll-mt-20 ${isStandalonePage ? 'min-h-screen' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb on Standalone Page */}
        {isStandalonePage && (
          <div className="mb-8">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Menu</span>
            </Link>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs sm:text-sm font-bold tracking-widest uppercase mb-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Fast & Secure Pakistani Food Delivery</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white">
            Place Your Order
          </h2>
          <p className="mt-3 text-stone-400 text-sm sm:text-base">
            Fill in your delivery details and review your selected dishes below in <span className="text-amber-400 font-bold">Pakistani Rupee (PKR)</span>. Orders are saved automatically to Supabase table <code className="text-amber-400 font-mono">orders</code> with default status <span className="text-amber-400 font-bold">Pending</span> and sent to Gmail.
          </p>
        </div>

        {/* Global Error Banner */}
        {submitError && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-950/80 border border-red-500/60 text-red-200 p-4 rounded-xl flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Order Submission Failed</div>
              <div className="text-xs text-red-300 mt-0.5">{submitError}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Customer Information Form */}
          <div className="lg:col-span-7 bg-stone-950/80 backdrop-blur-sm border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-5 border-b border-stone-800 mb-6">
              <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">1</span>
                Customer Information
              </h3>
              <span className="text-xs text-stone-400">* Required fields</span>
            </div>

            <form onSubmit={handlePlaceOrder} id="order-form" className="space-y-5">
              
              {/* Customer Name Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-500" />
                  <span>Customer Name *</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="e.g. Muhammad Hamza"
                  className={`w-full px-4 py-3 bg-stone-900 border rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-500/30'
                      : 'border-stone-700/80 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Customer Phone Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-amber-500" />
                  <span>Phone Number *</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }}
                  placeholder="e.g. 0300-1234567 or +92 321 8765432"
                  className={`w-full px-4 py-3 bg-stone-900 border rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? 'border-red-500 focus:ring-red-500/30'
                      : 'border-stone-700/80 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              {/* Customer Address Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>Delivery Address *</span>
                </label>
                <textarea
                  rows={3}
                  value={customerAddress}
                  onChange={(e) => {
                    setCustomerAddress(e.target.value);
                    if (errors.address) setErrors({ ...errors, address: undefined });
                  }}
                  placeholder="e.g. House 42, Street 5, Phase 5, DHA, Lahore"
                  className={`w-full px-4 py-3 bg-stone-900 border rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                    errors.address
                      ? 'border-red-500 focus:ring-red-500/30'
                      : 'border-stone-700/80 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
                {errors.address && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>

              {/* Optional Email Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span>Email Address (Optional)</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. customer@example.com (for order receipt copy)"
                  className="w-full px-4 py-3 bg-stone-900 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-stone-400" />
                  <span>Special Notes / Spice Level</span>
                </label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Medium spice, extra mint raita, please ring bell"
                  className="w-full px-4 py-3 bg-stone-900 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

            </form>
          </div>

          {/* RIGHT COLUMN: Selected Dishes, Quantities, & Place Order */}
          <div className="lg:col-span-5 bg-stone-950/80 backdrop-blur-sm border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between pb-5 border-b border-stone-800">
              <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">2</span>
                Selected Dishes
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs text-stone-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Dishes Selection Error */}
            {errors.items && (
              <div className="bg-red-950/60 border border-red-500/50 p-3 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errors.items}</span>
              </div>
            )}

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-8 px-4 text-center border-2 border-dashed border-stone-800 rounded-2xl">
                <ShoppingBag className="w-10 h-10 mx-auto text-stone-600 mb-2" />
                <p className="text-sm font-semibold text-stone-300">Your order is currently empty</p>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Select dishes and set quantities below to build your meal.
                </p>

                {/* Quick Add Recommendations in PKR */}
                <div className="mt-5 pt-4 border-t border-stone-800/80 text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500/90 block mb-2.5">
                    Popular Desi Recommendations:
                  </span>
                  <div className="space-y-2">
                    {MENU_ITEMS.slice(0, 3).map((dish) => (
                      <div
                        key={dish.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-stone-900 border border-stone-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-9 h-9 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-semibold text-stone-200">{dish.name}</div>
                            <div className="text-amber-400 font-bold">{formatPKR(dish.price)}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart(dish);
                            if (errors.items) setErrors({ ...errors, items: undefined });
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.dish.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.dish.image}
                        alt={item.dish.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-stone-100 line-clamp-1">
                          {item.dish.name}
                        </h4>
                        <div className="text-xs text-stone-400 mt-0.5">
                          {formatPKR(item.dish.price)} each
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.dish.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-amber-400">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.dish.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 flex items-center justify-center transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-20 text-right font-bold text-xs text-amber-400">
                        {formatPKR(item.dish.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Pricing in PKR */}
            <div className="pt-4 border-t border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal ({totalItemsCount} items)</span>
                <span className="font-semibold text-stone-200">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Delivery Fee</span>
                <span className="font-semibold text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-800 text-sm">
                <span className="font-bold text-stone-200">Total Price</span>
                <span className="text-2xl font-serif font-black text-amber-400">
                  {formatPKR(grandTotal)}
                </span>
              </div>
            </div>

            {/* Backend Integration Note Badges */}
            <div className="bg-stone-900/90 rounded-xl p-3 border border-stone-800 space-y-1.5 text-[11px] text-stone-400">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Stores in Supabase table <code className="text-amber-400 font-mono">orders</code> (Status: <b className="text-amber-300">Pending</b>)</span>
              </div>
              <div className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Dispatches summary email notification in PKR to Gmail</span>
              </div>
            </div>

            {/* PLACE ORDER BUTTON */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
                isSubmitting
                  ? 'bg-amber-600/70 text-stone-950 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 shadow-amber-500/20 active:scale-98'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Placing Order & Dispatching Email...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Place Order ({formatPKR(grandTotal)})</span>
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </section>
  );
};
