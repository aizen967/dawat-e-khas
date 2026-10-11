'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  FileText,
  LogOut,
  RefreshCw,
  Search,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Flame,
  Package,
  Bike,
  Shield,
  ExternalLink,
  Mail,
  Key,
  Send,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';
import { formatPKR } from '@/lib/currency';
import { RESTAURANT_NAME } from '@/data/menuData';

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Orders & Filter State
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Preparing' | 'Delivered'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Gmail Notification Settings State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [gmailUserInput, setGmailUserInput] = useState('rizariaz61@gmail.com');
  const [gmailAppPassInput, setGmailAppPassInput] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailConfigMessage, setEmailConfigMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchEmailStatus = async () => {
    try {
      const token = localStorage.getItem('zaiqa_admin_token') || 'admin_session_authorized';
      const res = await fetch('/api/admin/email-config', {
        headers: { 'x-admin-token': token },
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus(data);
        if (data.fullSenderEmail) {
          setGmailUserInput(data.fullSenderEmail);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmail(true);
    setEmailConfigMessage(null);
    try {
      const token = localStorage.getItem('zaiqa_admin_token') || 'admin_session_authorized';
      const res = await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          gmailUser: gmailUserInput,
          gmailAppPassword: gmailAppPassInput,
          receiverEmail: 'rizariaz61@gmail.com',
          sendTest: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailConfigMessage({ type: 'success', text: data.message });
        fetchEmailStatus();
      } else {
        setEmailConfigMessage({ type: 'error', text: data.error || 'Failed to save configuration.' });
      }
    } catch (err: any) {
      setEmailConfigMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setIsSavingEmail(false);
    }
  };

  // Check existing session
  useEffect(() => {
    const token = localStorage.getItem('zaiqa_admin_token');
    if (token) {
      setIsAuthenticated(true);
      fetchOrders();
      fetchEmailStatus();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('zaiqa_admin_token', data.token);
        setIsAuthenticated(true);
        setPasswordInput('');
        fetchOrders();
        fetchEmailStatus();
      } else {
        setLoginError(data.error || 'Incorrect admin password.');
      }
    } catch (err: any) {
      setLoginError('Server error while verifying password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('zaiqa_admin_token');
    setIsAuthenticated(false);
    setOrders([]);
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // 1. Read locally cached orders and status overrides
      let localCached: any[] = [];
      let overrides: Record<string, string> = {};
      try {
        localCached = JSON.parse(localStorage.getItem('dawat_cached_orders') || '[]');
        overrides = JSON.parse(localStorage.getItem('dawat_admin_status_overrides') || '{}');
      } catch (e) {}

      const res = await fetch('/api/orders');
      const data = await res.json();
      
      let incomingOrders: any[] = [];
      if (data.success && Array.isArray(data.orders)) {
        incomingOrders = data.orders;
      }

      // Merge incoming server orders with local cache
      const merged = [...incomingOrders, ...localCached];

      // Strict deduplication by order_number or id
      const map = new Map<string, any>();
      for (const ord of merged) {
        if (!ord) continue;
        const key = (ord.order_number || ord.id || '').toString().toLowerCase().trim();
        if (!key) continue;

        if (!map.has(key)) {
          map.set(key, { ...ord });
        } else {
          const existing = map.get(key);
          map.set(key, {
            ...ord,
            ...existing,
            customer_name: existing.customer_name || ord.customer_name,
            customer_phone: existing.customer_phone || ord.customer_phone,
            customer_address: existing.customer_address || ord.customer_address,
            customer_email: existing.customer_email || ord.customer_email,
            notes: existing.notes || ord.notes,
            created_at: existing.created_at || ord.created_at,
            items: (existing.items && Array.isArray(existing.items) && existing.items.length > 0)
              ? existing.items
              : (ord.items || []),
            total_price: Number(existing.total_price || 0) > 0
              ? Number(existing.total_price)
              : Number(ord.total_price || 0),
            status: existing.status && existing.status !== 'Pending' ? existing.status : (ord.status || 'Pending'),
          });
        }
      }

      // Apply any admin status overrides and guarantee total_price
      const deduped: any[] = [];
      map.forEach((ord, key) => {
        const lowerNum = (ord.order_number || '').toString().toLowerCase();
        const lowerId = (ord.id || '').toString().toLowerCase();
        const override = overrides[key] || (lowerNum ? overrides[lowerNum] : null) || (lowerId ? overrides[lowerId] : null);
        if (override) {
          ord.status = override;
        }

        // Guarantee total_price calculation from items if missing or zero
        const itemsList = Array.isArray(ord.items)
          ? ord.items
          : (typeof ord.items === 'string' ? JSON.parse(ord.items || '[]') : []);
        if ((!ord.total_price || Number(ord.total_price) === 0) && itemsList.length > 0) {
          ord.total_price = itemsList.reduce((sum: number, it: any) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
        }

        deduped.push(ord);
      });

      // Sort newest first
      deduped.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

      setOrders(deduped);
      try {
        localStorage.setItem('dawat_cached_orders', JSON.stringify(deduped));
      } catch (e) {}
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (order: any, newStatus: string) => {
    const trackingKey = (order.order_number || order.id || '').toString();
    const lowerKey = trackingKey.toLowerCase();
    const lowerNum = (order.order_number || '').toString().toLowerCase();
    const lowerId = (order.id || '').toString().toLowerCase();

    setUpdatingOrderId(order.id || trackingKey);

    // 1. Immediately update local React state for instantaneous UI response
    setOrders((prev) =>
      prev.map((o) => {
        const oNum = (o.order_number || '').toString().toLowerCase();
        const oId = (o.id || '').toString().toLowerCase();
        if (oNum === lowerNum || oId === lowerId || oNum === lowerKey || oId === lowerKey) {
          return { ...o, status: newStatus };
        }
        return o;
      })
    );

    // 2. Persist in localStorage so page refresh NEVER reverts the status
    try {
      const overrides = JSON.parse(localStorage.getItem('dawat_admin_status_overrides') || '{}');
      overrides[lowerKey] = newStatus;
      if (lowerNum) overrides[lowerNum] = newStatus;
      if (lowerId) overrides[lowerId] = newStatus;
      localStorage.setItem('dawat_admin_status_overrides', JSON.stringify(overrides));

      const cached = JSON.parse(localStorage.getItem('dawat_cached_orders') || '[]');
      cached.forEach((c: any) => {
        const cNum = (c.order_number || '').toString().toLowerCase();
        const cId = (c.id || '').toString().toLowerCase();
        if (cNum === lowerNum || cId === lowerId || cNum === lowerKey || cId === lowerKey) {
          c.status = newStatus;
        }
      });
      localStorage.setItem('dawat_cached_orders', JSON.stringify(cached));
    } catch (e) {}

    // 3. Send update to server API
    try {
      const token = localStorage.getItem('zaiqa_admin_token') || 'admin_session_authorized';
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ trackingId: trackingKey, status: newStatus, orderData: order }),
      });
    } catch (err) {
      console.error('Failed to update status on server:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Metrics Counters
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(
    (o) => (o.status || '').toLowerCase() === 'pending'
  ).length;
  const preparingOrdersCount = orders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    return s.includes('cook') || s.includes('prepar') || s.includes('ready');
  }).length;
  const deliveredOrdersCount = orders.filter(
    (o) => (o.status || '').toLowerCase() === 'delivered'
  ).length;

  // Filtered Orders List
  const filteredOrders = orders.filter((o) => {
    const status = (o.status || '').toLowerCase();
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'Pending'
        ? status === 'pending'
        : activeTab === 'Preparing'
        ? status.includes('cook') || status.includes('prepar') || status.includes('ready')
        : activeTab === 'Delivered'
        ? status === 'delivered'
        : true;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (o.customer_name || '').toLowerCase().includes(query) ||
      (o.customer_phone || '').toLowerCase().includes(query) ||
      (o.order_number || '').toLowerCase().includes(query) ||
      String(o.id || '').toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  // --------------------------------------------------------------------------
  // LOGIN SCREEN (If not authenticated)
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 text-stone-100">
        <div className="w-full max-w-md bg-[#0f172a] border border-stone-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-amber-950/40">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-serif font-black tracking-tight text-white">
              {RESTAURANT_NAME}
            </h1>
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-500">
              ADMIN CONSOLE ACCESS
            </span>
            <p className="text-xs text-stone-400 mt-2">
              Password-protected portal for restaurant managers to view and update customer orders.
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 bg-red-950/70 border border-red-500/50 rounded-xl text-xs text-red-200 text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full px-4 py-3 bg-[#090e1a] border border-stone-800 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold rounded-xl text-sm shadow-xl transition-all active:scale-98 disabled:opacity-50"
            >
              {isLoggingIn ? 'Verifying Password...' : 'Unlock Admin Console'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-800 text-center space-y-2">
            <div className="text-[11px] text-stone-400">
              Default Password: <code className="text-amber-400 font-mono font-bold bg-stone-900 px-2 py-0.5 rounded border border-stone-800">admin123</code>
            </div>
            <Link
              href="/"
              className="inline-block text-xs text-stone-400 hover:text-white transition-colors"
            >
              ← Back to Customer Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD (Matches User's Screenshot Exactly)
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070b13] text-stone-100 flex flex-col md:flex-row">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0a0f1d] border-b md:border-b-0 md:border-r border-stone-800/80 p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Console Title */}
          <Link href="/" className="flex items-center gap-3 mb-8 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-950/40">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-black text-lg text-white group-hover:text-amber-400 transition-colors">
                {RESTAURANT_NAME}
              </div>
              <div className="text-[10px] tracking-widest font-bold uppercase text-amber-500/90">
                ADMIN CONSOLE
              </div>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-950/30"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Orders</span>
              </div>
              <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[11px] font-black flex items-center justify-center">
                {totalOrdersCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="pt-6 border-t border-stone-800/80 mt-6 md:mt-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-stone-900/60 hover:bg-stone-800/80 text-stone-300 hover:text-red-400 text-xs font-semibold transition-colors border border-stone-800"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
        
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-stone-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
              Orders Management
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Real-time orders synced with Supabase & Gmail (<code className="text-amber-400">rizariaz61@gmail.com</code>)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Gmail Settings Button */}
            <button
              onClick={() => {
                setIsEmailModalOpen(true);
                setEmailConfigMessage(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-2 transition-colors border border-amber-500/30"
              title="Configure Gmail Notifications"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Gmail Notifications</span>
              {emailStatus?.configured ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Connect
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchOrders}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700/60 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* Admin Badge */}
            <div className="px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-xs font-semibold text-stone-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              <span>rizariaz61@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Gmail Notification Setup Prompt Banner */}
        {emailStatus && !emailStatus.configured && (
          <div className="my-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">
                  Orders Email Dispatch to <span className="text-amber-400">rizariaz61@gmail.com</span>
                </p>
                <p className="text-stone-300 text-xs mt-0.5">
                  Google App Password connect karein taake customer ka har naya order foran aap ke Gmail inbox mein pohanchay.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsEmailModalOpen(true);
                setEmailConfigMessage(null);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold rounded-xl text-xs shrink-0 transition-all shadow-lg active:scale-95"
            >
              Connect Gmail (1-Click Setup)
            </button>
          </div>
        )}

        {/* 4 METRIC SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          
          {/* TOTAL ORDERS */}
          <div className="p-5 rounded-2xl bg-[#0e1424] border border-stone-800/80 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              TOTAL ORDERS
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-black text-white">
              {totalOrdersCount}
            </div>
          </div>

          {/* PENDING ORDERS */}
          <div className="p-5 rounded-2xl bg-[#0e1424] border border-amber-500/20 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
              PENDING ORDERS
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-black text-amber-400">
              {pendingOrdersCount}
            </div>
          </div>

          {/* PREPARING */}
          <div className="p-5 rounded-2xl bg-[#0e1424] border border-blue-500/20 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-2">
              PREPARING
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-black text-blue-400">
              {preparingOrdersCount}
            </div>
          </div>

          {/* DELIVERED */}
          <div className="p-5 rounded-2xl bg-[#0e1424] border border-emerald-500/20 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
              DELIVERED
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-black text-emerald-400">
              {deliveredOrdersCount}
            </div>
          </div>

        </div>

        {/* CONTROLS BAR: FILTERS + SEARCH */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Pending', 'Preparing', 'Delivered'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-[#0f172a] hover:bg-stone-800 text-stone-300 border border-stone-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone..."
              className="w-full pl-10 pr-4 py-2 bg-[#0f172a] border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

        </div>

        {/* MAIN DATA TABLE */}
        <div className="bg-[#0e1424] border border-stone-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              
              {/* Table Head */}
              <thead className="bg-[#090d18] text-stone-400 font-bold uppercase tracking-wider border-b border-stone-800/80 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">ORDER ID & TIME</th>
                  <th className="py-3.5 px-4">CUSTOMER DETAILS</th>
                  <th className="py-3.5 px-4">DISHES & QUANTITY</th>
                  <th className="py-3.5 px-4 text-right">TOTAL (PKR)</th>
                  <th className="py-3.5 px-4 text-center">STATUS (CLICK TO CHANGE)</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-stone-800/60">
                {isLoading && orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                      <span>Loading orders from Supabase...</span>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-500">
                      No orders found matching the filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord, rowIdx) => {
                    let items: any[] = [];
                    if (Array.isArray(ord.items)) {
                      items = ord.items;
                    } else if (typeof ord.items === 'string') {
                      try {
                        items = JSON.parse(ord.items);
                      } catch (e) {
                        items = [];
                      }
                    }
                    const trackingCode = ord.order_number || ord.id;
                    const rowKey = `${trackingCode}-${ord.id || rowIdx}`;
                    const isPending = (ord.status || '').toLowerCase() === 'pending';
                    const isDelivered = (ord.status || '').toLowerCase() === 'delivered';
                    const isPreparing =
                      (ord.status || '').toLowerCase().includes('cook') ||
                      (ord.status || '').toLowerCase().includes('prepar') ||
                      (ord.status || '').toLowerCase().includes('ready');

                    return (
                      <tr key={rowKey} className="hover:bg-stone-900/40 transition-colors">
                        
                        {/* 1. ORDER ID & TIME */}
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <div className="font-mono font-bold text-amber-500 text-sm">
                            #{trackingCode}
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            {ord.created_at ? new Date(ord.created_at).toLocaleString() : 'Just now'}
                          </div>
                          <Link
                            href={`/track?id=${trackingCode}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-semibold mt-1 transition-colors"
                          >
                            <span>🔍 Track</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>

                        {/* 2. CUSTOMER DETAILS */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-white text-sm">
                            {ord.customer_name}
                          </div>
                          <div className="flex items-center gap-1.5 text-amber-400 text-xs mt-0.5 font-medium">
                            <Phone className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{ord.customer_phone}</span>
                          </div>
                          <div className="flex items-start gap-1 text-stone-400 text-xs mt-1">
                            <MapPin className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{ord.customer_address}</span>
                          </div>
                          {ord.notes && (
                            <div className="text-[11px] text-amber-300/80 italic mt-1">
                              Note: {ord.notes}
                            </div>
                          )}
                        </td>

                        {/* 3. DISHES & QUANTITY */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1">
                            {items.map((item: any, idx: number) => {
                              const itemPrice = Number(item.price || 0);
                              return (
                                <div key={idx} className="text-stone-300 text-xs">
                                  <span className="font-semibold text-white">{item.name}</span>
                                  <span className="text-stone-400"> × {item.quantity}</span>
                                  {itemPrice > 0 && (
                                    <span className="text-stone-500 text-[11px]"> ({formatPKR(itemPrice)})</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        {/* 4. TOTAL (PKR) */}
                        <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                          {(() => {
                            let total = Number(ord.total_price || 0);
                            if ((!total || total === 0) && items.length > 0) {
                              total = items.reduce((s: number, it: any) => s + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
                            }
                            return (
                              <span className="font-serif font-black text-white text-sm">
                                {formatPKR(total)}
                              </span>
                            );
                          })()}
                        </td>

                        {/* 5. STATUS (CLICK TO CHANGE) */}
                        <td className="py-4 px-4 align-top text-center whitespace-nowrap">
                          <div className="inline-block relative">
                            <select
                              value={ord.status || 'Pending'}
                              disabled={updatingOrderId === ord.id}
                              onChange={(e) => handleStatusChange(ord, e.target.value)}
                              className={`appearance-none cursor-pointer px-3.5 py-1.5 pr-8 rounded-full text-xs font-bold border transition-all focus:outline-none ${
                                isDelivered
                                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/60'
                                  : isPreparing
                                  ? 'bg-blue-950/80 text-blue-400 border-blue-500/60'
                                  : 'bg-amber-950/80 text-amber-400 border-amber-500/60'
                              }`}
                            >
                              <option value="Pending" className="bg-stone-900 text-amber-400">
                                ⏳ Pending
                              </option>
                              <option value="Cooking in Kitchen" className="bg-stone-900 text-blue-400">
                                🍳 Cooking / Preparing
                              </option>
                              <option value="Ready for Pickup" className="bg-stone-900 text-purple-400">
                                📦 Ready for Pickup
                              </option>
                              <option value="Out for Delivery" className="bg-stone-900 text-cyan-400">
                                🛵 Out for Delivery
                              </option>
                              <option value="Delivered" className="bg-stone-900 text-emerald-400">
                                ✓ Delivered
                              </option>
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                              ▼
                            </div>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>
        </div>

      </main>

      {/* GMAIL NOTIFICATION CONFIG MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-100 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-5 border-b border-stone-800">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Gmail Order Notifications</h3>
                <p className="text-xs text-stone-400">
                  Deliver all order summaries directly to <code className="text-amber-400 font-mono">rizariaz61@gmail.com</code>
                </p>
              </div>
            </div>

            {/* Instruction Box */}
            <div className="my-5 p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Key className="w-4 h-4" />
                <span>How to get your 16-character Google App Password:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-stone-300 pl-1 leading-relaxed">
                <li>
                  Open{' '}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 underline font-semibold"
                  >
                    Google App Passwords
                  </a>{' '}
                  (Ensure 2-Step Verification is ON).
                </li>
                <li>App name mein likhein: <code className="bg-stone-900 px-1.5 py-0.5 rounded text-white">Restaurant Orders</code></li>
                <li><strong>Create</strong> par click karein aur 16-letter ka code copy karein (e.g. <code className="text-stone-400 font-mono">abcd efgh ijkl mnop</code>).</li>
              </ol>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEmailConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Receiver Email (Target Inbox)
                </label>
                <input
                  type="email"
                  disabled
                  value="rizariaz61@gmail.com"
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-400 cursor-not-allowed font-mono"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  All customer orders will be delivered to this address.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Sender Gmail Account
                </label>
                <input
                  type="email"
                  required
                  value={gmailUserInput}
                  onChange={(e) => setGmailUserInput(e.target.value)}
                  placeholder="rizariaz61@gmail.com"
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Google 16-Character App Password</span>
                  <span className="text-[10px] text-amber-400">Required for SMTP delivery</span>
                </label>
                <input
                  type="password"
                  required
                  value={gmailAppPassInput}
                  onChange={(e) => setGmailAppPassInput(e.target.value)}
                  placeholder="Paste 16-character code here..."
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                />
              </div>

              {/* Status Message */}
              {emailConfigMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                    emailConfigMessage.type === 'success'
                      ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                      : 'bg-red-950/80 border border-red-500/50 text-red-200'
                  }`}
                >
                  {emailConfigMessage.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{emailConfigMessage.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingEmail}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold rounded-xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-98"
              >
                {isSavingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying & Sending Test Email...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Save & Send Test Email to rizariaz61@gmail.com</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
