'use client';

import React, { useState, useEffect } from 'react';
import { Database, X, RefreshCw, Clock, User, Phone, MapPin, Tag } from 'lucide-react';
import { formatPKR } from '@/lib/currency';

interface OrderHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryDrawer: React.FC<OrderHistoryDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState<string>('');

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
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-900 border-l border-stone-800 text-stone-100 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Live Database Orders</h3>
                <div className="text-xs text-stone-400 flex items-center gap-1.5">
                  <span>Table: <code className="text-amber-400 font-mono">orders</code></span>
                  <span>•</span>
                  <span className="text-emerald-400">
                    {source === 'supabase' ? 'Supabase Live' : 'Session Cache'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={fetchOrders}
                disabled={isLoading}
                className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Refresh orders"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-16 text-stone-500">
                <Clock className="w-10 h-10 mx-auto mb-2 text-stone-600" />
                <p className="text-sm font-semibold text-stone-300">No orders recorded yet</p>
                <p className="text-xs text-stone-500 mt-1">
                  Place an order via the checkout form to see it appear here with status "Pending".
                </p>
              </div>
            ) : (
              orders.map((ord: any, index: number) => {
                const itemsList = Array.isArray(ord.items) ? ord.items : [];
                return (
                  <div
                    key={ord.id || index}
                    className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3"
                  >
                    {/* Top Row: ID & Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-stone-400 font-semibold truncate max-w-[160px]">
                        #{ord.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{ord.status || 'Pending'}</span>
                      </span>
                    </div>

                    {/* Customer details */}
                    <div className="text-xs space-y-1 text-stone-300 pt-1 border-t border-stone-900">
                      <div className="flex items-center gap-1.5 font-semibold text-stone-100">
                        <User className="w-3.5 h-3.5 text-stone-500" />
                        <span>{ord.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <Phone className="w-3.5 h-3.5 text-stone-500" />
                        <span>{ord.customer_phone}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-stone-400">
                        <MapPin className="w-3.5 h-3.5 text-stone-500 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{ord.customer_address}</span>
                      </div>
                    </div>

                    {/* Items & Total */}
                    <div className="pt-2 border-t border-stone-900 text-xs">
                      <div className="text-[11px] text-stone-400 mb-1 font-medium">Dishes Ordered:</div>
                      <div className="space-y-0.5">
                        {itemsList.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-stone-300 text-[11px]">
                            <span>{item.name} × {item.quantity}</span>
                            <span className="font-mono text-stone-400">{formatPKR(item.itemTotal || (item.price * item.quantity))}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-stone-900 font-bold">
                        <span className="text-stone-300">Total Price</span>
                        <span className="text-amber-400 font-serif text-sm">
                          {formatPKR(Number(ord.total_price))}
                        </span>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-[10px] text-stone-500 text-right">
                      {ord.created_at ? new Date(ord.created_at).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stone-800 text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors"
            >
              Close Drawer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
