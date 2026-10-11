'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, ShoppingBag, Database, Mail, Menu as MenuIcon, X, Info, PhoneCall, Truck, Shield, User } from 'lucide-react';
import { RESTAURANT_NAME } from '@/data/menuData';
import { useCart } from '@/context/CartContext';
import { formatPKR } from '@/lib/currency';

interface NavbarProps {
  onOpenConfigModal?: () => void;
  onOpenRoleModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConfigModal, onOpenRoleModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, cartTotal } = useCart();
  const pathname = usePathname();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Order Online', href: '/order' },
    { label: 'Track Order', href: '/track', icon: Truck },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800 transition-all shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link 
            href="/"
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                {RESTAURANT_NAME}
              </span>
              <span className="block text-[11px] font-medium tracking-widest uppercase text-amber-500/90">
                Royal Pakistani Cuisine & Delivery
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    active
                      ? 'text-amber-400 bg-stone-800/80 font-semibold'
                      : 'text-stone-300 hover:text-amber-400 hover:bg-stone-800/40'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-emerald-400" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Action Tools & Cart */}
          <div className="flex items-center gap-3">
            {/* Switch Role Trigger */}
            <button
              onClick={() => {
                if (onOpenRoleModal) {
                  onOpenRoleModal();
                } else if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('dawat_open_role_modal'));
                }
              }}
              className="hidden sm:flex items-center gap-1.5 text-xs bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 hover:text-amber-400 px-3 py-2 rounded-lg border border-stone-700/60 transition-colors cursor-pointer"
              title="Switch between Customer and Admin"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch Role</span>
            </button>

            {/* Status Modal Trigger */}
            {onOpenConfigModal && (
              <button
                onClick={onOpenConfigModal}
                className="hidden sm:flex items-center gap-1.5 text-xs bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 px-3 py-2 rounded-lg border border-stone-700/60 transition-colors"
                title="Supabase & Gmail Status"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Diagnostics</span>
              </button>
            )}

            {/* Cart Pill with Pakistani Rupee Price */}
            <Link
              href="/order"
              className="flex items-center gap-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-amber-900/20 active:scale-95 transition-all"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-stone-900 text-amber-400 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-amber-400 shadow-sm animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                {cartCount > 0 ? formatPKR(cartTotal) : 'Cart'}
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-400 hover:text-stone-100 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-900 border-b border-stone-800 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium ${
                  active
                    ? 'text-amber-400 bg-stone-800'
                    : 'text-stone-200 hover:text-amber-400 hover:bg-stone-800/60'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-emerald-400" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-stone-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenRoleModal) {
                  onOpenRoleModal();
                } else if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('dawat_open_role_modal'));
                }
              }}
              className="flex items-center gap-2 py-2 px-3 text-amber-400 hover:text-amber-300 text-sm w-full font-semibold cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Switch Role (Customer / Admin)</span>
            </button>
          </div>
          {onOpenConfigModal && (
            <div className="pt-2 border-t border-stone-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConfigModal();
                }}
                className="flex items-center gap-2 py-2 px-3 text-stone-300 hover:text-amber-400 text-sm w-full"
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Integration Diagnostics</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
