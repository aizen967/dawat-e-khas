'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EmailTestModal } from '@/components/EmailTestModal';
import { formatPKR } from '@/lib/currency';
import { ORDER_TRACKING_STEPS, OrderStatusType } from '@/lib/types';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Flame,
  PackageCheck,
  Bike,
  Receipt,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Lock,
  Shield,
} from 'lucide-react';

function OrderTrackerContent() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id') || searchParams.get('trackingId') || '';

  const [searchInput, setSearchInput] = useState(urlId);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentOrdersList, setRecentOrdersList] = useState<any[]>([]);

  // Fetch recent orders for quick testing recommendations
  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.orders) {
          setRecentOrdersList(data.orders.slice(0, 5));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch order by tracking ID
  const searchOrder = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders?trackingId=${encodeURIComponent(idToSearch.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.order) {
        throw new Error(data.error || `No order found with tracking number "${idToSearch}".`);
      }

      const orderData = data.order;
      try {
        const overrides = JSON.parse(localStorage.getItem('dawat_admin_status_overrides') || '{}');
        const num = (orderData.order_number || '').toLowerCase();
        const id = (orderData.id || '').toLowerCase();
        const override = overrides[num] || overrides[id] || overrides[idToSearch.trim().toLowerCase()];
        if (override) {
          orderData.status = override;
        }
      } catch (e) {}

      setCurrentOrder(orderData);
    } catch (err: any) {
      setCurrentOrder(null);
      setError(err.message || 'Failed to fetch order details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto search if query param is in URL
  useEffect(() => {
    if (urlId) {
      setSearchInput(urlId);
      searchOrder(urlId);
    }
  }, [urlId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrder(searchInput);
  };


  // Calculate current active step index (0 to 4)
  const getActiveStepIndex = (status: string): number => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Cooking in Kitchen':
        return 1;
      case 'Ready for Pickup':
        return 2;
      case 'Out for Delivery':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = currentOrder ? getActiveStepIndex(currentOrder.status) : 0;
  const progressPercent = Math.min(100, Math.max(10, (activeIndex / (ORDER_TRACKING_STEPS.length - 1)) * 100));

  const getStepIcon = (iconName: string, isPassed: boolean, isCurrent: boolean) => {
    const className = `w-5 h-5 ${
      isCurrent
        ? 'text-amber-950 animate-pulse'
        : isPassed
        ? 'text-white'
        : 'text-stone-500'
    }`;

    switch (iconName) {
      case 'Receipt':
        return <Receipt className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'PackageCheck':
        return <PackageCheck className={className} />;
      case 'Bike':
        return <Bike className={className} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={className} />;
      default:
        return <Clock className={className} />;
    }
  };

  return (
    <section className="flex-1 py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
          <Truck className="w-4 h-4" />
          <span>Daraz-Style Live Order Tracker</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-white">
          Track Your Order
        </h1>
        <p className="mt-2 text-stone-400 text-sm sm:text-base">
          Apna Daraz Order Number enter karein aur live check karein ke order <span className="text-amber-400 font-semibold">Cook ho raha hai</span>, <span className="text-amber-400 font-semibold">Ready hai</span>, ya <span className="text-emerald-400 font-semibold">Deliver ho chuka hai</span>.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Order Tracking Number (e.g. DW-784291)..."
              className="w-full pl-12 pr-4 py-4 bg-stone-900 border border-stone-800 rounded-2xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 shadow-xl font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold rounded-2xl text-sm flex items-center gap-2 shadow-xl active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Truck className="w-4 h-4" />
            )}
            <span>Track</span>
          </button>
        </form>

        {/* Quick Click Order Suggestions */}
        {recentOrdersList.length > 0 && !currentOrder && (
          <div className="mt-4 p-3 bg-stone-900/60 rounded-xl border border-stone-800/80 text-xs flex flex-wrap items-center gap-2">
            <span className="text-stone-400 font-medium">Recent Orders:</span>
            {recentOrdersList.map((rec) => {
              const num = rec.order_number || rec.id;
              return (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => {
                    setSearchInput(num);
                    searchOrder(num);
                  }}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-400 font-mono text-[11px] font-bold rounded-lg transition-colors"
                >
                  {num} ({rec.customer_name?.split(' ')[0]})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto mb-10 p-4 bg-red-950/80 border border-red-500/50 rounded-2xl text-xs text-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TRACKING PROGRESS CARD */}
      {currentOrder && (
        <div className="max-w-4xl mx-auto bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-10 animate-in fade-in duration-300">
          
          {/* Order Header Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
            <div>
              <span className="text-xs uppercase font-bold text-amber-500 tracking-wider">
                Order Tracking ID (Daraz Format)
              </span>
              <h2 className="text-3xl font-mono font-black text-white mt-1">
                #{currentOrder.order_number || currentOrder.id}
              </h2>
              <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Placed: {new Date(currentOrder.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-xs font-black uppercase tracking-wider shadow-md">
                Status: {currentOrder.status}
              </span>
              <div className="text-xs text-stone-400 mt-2">
                Estimated Delivery: <strong className="text-white">25-35 Mins</strong>
              </div>
            </div>
          </div>

          {/* DARAZ-STYLE STEP PROGRESS BAR */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Live Order Progress (Kitna Kaam Baaki Hai)</span>
              </h3>
              <span className="text-xs font-bold text-amber-400 font-mono">
                {progressPercent}% Complete
              </span>
            </div>

            {/* Visual Step Timeline */}
            <div className="relative mb-8">
              {/* Progress Background Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-stone-800 -translate-y-1/2 z-0 rounded-full" />
              {/* Progress Filled Line */}
              <div
                className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />

              {/* Step Bubbles */}
              <div className="relative z-10 flex justify-between">
                {ORDER_TRACKING_STEPS.map((s, index) => {
                  const isCurrent = index === activeIndex;
                  const isPassed = index <= activeIndex;

                  return (
                    <div
                      key={s.step}
                      className="flex flex-col items-center select-none"
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isCurrent
                            ? 'bg-amber-400 ring-4 ring-amber-400/30 scale-110 shadow-lg'
                            : isPassed
                            ? 'bg-emerald-600 shadow-md'
                            : 'bg-stone-900 border border-stone-800'
                        }`}
                      >
                        {getStepIcon(s.iconName, isPassed, isCurrent)}
                      </div>

                      <span
                        className={`text-[11px] font-bold mt-3 text-center hidden md:block max-w-[100px] leading-tight ${
                          isCurrent
                            ? 'text-amber-400'
                            : isPassed
                            ? 'text-stone-200'
                            : 'text-stone-500'
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Status Highlight Card (Urdu & English) */}
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Current Stage: {ORDER_TRACKING_STEPS[activeIndex]?.title}
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {ORDER_TRACKING_STEPS[activeIndex]?.urduTitle}
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  {ORDER_TRACKING_STEPS[activeIndex]?.urduDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Read-Only Status Notice for Customers */}
          <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-stone-200">
                  Customer Live Tracking (Read-Only)
                </p>
                <p className="text-[11px] text-stone-400">
                  Order status change authority sirf Restaurant Admin ke pass hai. Status update hone par yeh progress bar khud update ho jati hai.
                </p>
              </div>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-[11px] font-bold border border-stone-700 transition-colors shrink-0 w-fit"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Customer & Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-800">
            {/* Delivery Details */}
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2.5 text-xs">
              <h4 className="font-bold text-stone-300 uppercase tracking-wider text-xs">
                Delivery Details
              </h4>
              <div className="flex items-center gap-2 text-stone-300">
                <User className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>Customer: <strong className="text-white">{currentOrder.customer_name}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>Phone: <strong className="text-white">{currentOrder.customer_phone}</strong></span>
              </div>
              <div className="flex items-start gap-2 text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                <span>Address: <strong className="text-white">{currentOrder.customer_address}</strong></span>
              </div>
              {currentOrder.notes && (
                <div className="text-[11px] text-amber-400 italic pt-1">
                  Spice / Notes: {currentOrder.notes}
                </div>
              )}
            </div>

            {/* Dishes Ordered in PKR */}
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2.5 text-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-stone-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Selected Dishes</span>
                </h4>
                <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
                  {(() => {
                    const itemsList = Array.isArray(currentOrder.items)
                      ? currentOrder.items
                      : (typeof currentOrder.items === 'string' ? JSON.parse(currentOrder.items || '[]') : []);
                    return itemsList.map((item: any, i: number) => {
                      const itemTotal = item.itemTotal ?? (Number(item.price || 0) * Number(item.quantity || 1));
                      return (
                        <div key={i} className="flex justify-between text-stone-300 text-xs">
                          <span>{item.name} × {item.quantity}</span>
                          <span className="font-mono text-stone-400">
                            {formatPKR(itemTotal)}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 flex justify-between items-baseline font-bold">
                <span className="text-stone-300">Grand Total:</span>
                <span className="text-xl font-serif font-black text-amber-400">
                  {(() => {
                    let tot = Number(currentOrder.total_price || 0);
                    if ((!tot || tot === 0) && currentOrder.items) {
                      const itemsList = Array.isArray(currentOrder.items)
                        ? currentOrder.items
                        : (typeof currentOrder.items === 'string' ? JSON.parse(currentOrder.items || '[]') : []);
                      tot = itemsList.reduce((s: number, it: any) => s + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
                    }
                    return formatPKR(tot);
                  })()}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

    </section>
  );
}

export default function TrackOrderPage() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-stone-950 text-stone-100">
      <Navbar onOpenConfigModal={() => setIsConfigModalOpen(true)} />
      <Suspense fallback={<div className="text-center py-20 text-stone-400">Loading Order Tracker...</div>}>
        <OrderTrackerContent />
      </Suspense>
      <Footer />
      <EmailTestModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </main>
  );
}
