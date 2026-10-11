'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EmailTestModal } from '@/components/EmailTestModal';
import { Database, RefreshCw, Clock, User, Phone, MapPin, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPKR } from '@/lib/currency';

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<string>('supabase');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setSource(data.source || 'supabase');
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((ord) => {
    const query = filterText.toLowerCase();
    const name = (ord.customer_name || '').toLowerCase();
    const phone = (ord.customer_phone || '').toLowerCase();
    const id = (ord.id || '').toLowerCase();
    return name.includes(query) || phone.includes(query) || id.includes(query);
  });

  return (
    <main className="min-h-screen flex flex-col bg-stone-950 text-stone-100">
      <Navbar onOpenConfigModal={() => setIsConfigModalOpen(true)} />

      <section className="flex-1 py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-stone-800">
          <div>
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Database className="w-4 h-4" />
              <span>Real-Time Supabase Sync</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-white">
              Live Orders Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Orders stored in Supabase database table <code className="text-amber-400 font-mono">orders</code> with default status <span className="text-amber-400 font-bold">Pending</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-300">
              Source: <strong className="text-emerald-400">{source === 'supabase' ? 'Supabase Live' : 'Session Cache'}</strong>
            </span>
            <button
              onClick={fetchOrders}
              disabled={isLoading}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-xl text-xs font-bold text-stone-200 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/order"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>New Order</span>
            </Link>
          </div>
        </div>

        {/* Filter input */}
        <div className="my-6 max-w-md">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search orders by customer name, phone, or order ID..."
            className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Orders Grid / Cards */}
        {isLoading ? (
          <div className="text-center py-20 text-stone-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-500" />
            <p className="text-sm">Loading orders from Supabase...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-stone-900/40 rounded-3xl border border-stone-800 p-8">
            <Clock className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-200">No Orders Found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              {filterText
                ? 'No orders match your search keyword. Clear the search input to see all records.'
                : 'No orders have been recorded yet. Place an order on our menu to see it appear here in real-time.'}
            </p>
            <Link
              href="/order"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs"
            >
              <span>Place Your First Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((ord: any) => {
              const itemsList = Array.isArray(ord.items) ? ord.items : [];
              return (
                <div
                  key={ord.id}
                  className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-md"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                      <span className="text-xs font-mono font-bold text-amber-400 truncate max-w-[170px]">
                        #{ord.id}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{ord.status || 'Pending'}</span>
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="text-xs space-y-1.5 text-stone-300">
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <User className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span>{ord.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-400">
                        <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span>{ord.customer_phone}</span>
                      </div>
                      <div className="flex items-start gap-2 text-stone-400">
                        <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{ord.customer_address}</span>
                      </div>
                      {ord.notes && (
                        <div className="text-[11px] text-amber-400/90 italic pt-1">
                          Notes: {ord.notes}
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="pt-3 border-t border-stone-800 text-xs">
                      <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider mb-1.5">
                        Items ({itemsList.length}):
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {itemsList.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-stone-300 text-xs">
                            <span className="line-clamp-1">{item.name} × {item.quantity}</span>
                            <span className="font-mono text-stone-400 shrink-0 ml-2">
                              {formatPKR(item.itemTotal || (item.price * item.quantity))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Total and Date */}
                  <div className="pt-4 mt-4 border-t border-stone-800">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs text-stone-400 font-semibold">Total Price:</span>
                      <span className="text-lg font-serif font-black text-amber-400">
                        {formatPKR(Number(ord.total_price))}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500 text-right">
                      {ord.created_at ? new Date(ord.created_at).toLocaleString() : 'Recent'}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

      <Footer />

      <EmailTestModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </main>
  );
}
