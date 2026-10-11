'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { OrderResponse } from '@/lib/types';
import { formatPKR } from '@/lib/currency';
import {
  CheckCircle2,
  X,
  Database,
  Mail,
  MapPin,
  Phone,
  User,
  Clock,
  ShoppingBag,
  Copy,
  Check,
  Truck,
  ArrowRight,
} from 'lucide-react';

interface OrderSuccessModalProps {
  orderResponse: OrderResponse | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderResponse,
  onClose,
  onViewOrders,
}) => {
  const [copied, setCopied] = useState(false);

  if (!orderResponse) return null;

  const { order, supabaseResult, emailResult } = orderResponse;
  const trackingNumber = order.order_number || orderResponse.orderNumber || order.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl text-stone-100 p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon & Header */}
        <div className="text-center pb-6 border-b border-stone-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 ring-8 ring-emerald-500/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Order Confirmed (آرڈر موصول ہو گیا)
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
            Thank You, {order.customer_name}!
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Aap ka order kitchen manager ko phonch chuka hai.
          </p>

          {/* DARAZ-STYLE TRACKING NUMBER HIGHLIGHT BOX */}
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-stone-950 to-amber-500/10 border-2 border-amber-500/40 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Your Daraz-Style Order Tracking Number:
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider my-1">
              {trackingNumber}
            </div>
            <p className="text-[11px] text-stone-400 mb-3">
              Is order number se aap kisi bhi waqt live status check kar sakte hain.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tracking ID Copied!' : 'Copy Tracking ID'}</span>
              </button>

              <Link
                href={`/track?id=${trackingNumber}`}
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Order Status Live (Daraz-Style)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Integration Status Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
          
          {/* Supabase Status */}
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800/80 flex items-center gap-3 text-xs">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-200">Supabase Database</div>
              <div className="text-stone-400 text-[11px]">
                {supabaseResult.mode === 'database'
                  ? 'Saved to table: orders (Status: Pending)'
                  : 'Saved (Session Demo Mode)'}
              </div>
            </div>
          </div>

          {/* Gmail Status */}
          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800/80 flex items-center gap-3 text-xs">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-200">Gmail Summary Email</div>
              <div className="text-stone-400 text-[11px] truncate max-w-[190px]">
                {emailResult.mode === 'smtp_sent'
                  ? `Sent to ${emailResult.recipient}`
                  : 'Dispatched with Tracking Link'}
              </div>
            </div>
          </div>

        </div>

        {/* Customer Information Block */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs space-y-2 mb-6">
          <div className="font-bold text-stone-300 text-xs uppercase tracking-wider mb-2">
            Delivery Details
          </div>
          <div className="flex items-center gap-2 text-stone-300">
            <User className="w-3.5 h-3.5 text-stone-500" />
            <span>Customer: <strong className="text-white">{order.customer_name}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-stone-300">
            <Phone className="w-3.5 h-3.5 text-stone-500" />
            <span>Phone: <strong className="text-white">{order.customer_phone}</strong></span>
          </div>
          <div className="flex items-start gap-2 text-stone-300">
            <MapPin className="w-3.5 h-3.5 text-stone-500 mt-0.5 shrink-0" />
            <span>Address: <strong className="text-white">{order.customer_address}</strong></span>
          </div>
        </div>

        {/* Ordered Dishes Table in PKR */}
        <div className="space-y-3 mb-6">
          <div className="font-bold text-stone-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
            <span>Order Summary ({order.items.length} items)</span>
          </div>
          <div className="divide-y divide-stone-800 border border-stone-800 rounded-2xl overflow-hidden bg-stone-950">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-stone-200">{item.name}</div>
                  <div className="text-[11px] text-stone-500">
                    Qty: {item.quantity} × {formatPKR(item.price)}
                  </div>
                </div>
                <div className="font-bold text-white">{formatPKR(item.itemTotal)}</div>
              </div>
            ))}
            <div className="p-3 bg-stone-900/60 flex items-center justify-between text-sm font-bold">
              <span className="text-stone-300">Total Price</span>
              <span className="text-amber-400 text-base font-serif">{formatPKR(order.total_price)}</span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>View All Supabase Orders</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 text-xs font-bold transition-all shadow-md"
          >
            Close & Order Again
          </button>
        </div>

      </div>
    </div>
  );
};
