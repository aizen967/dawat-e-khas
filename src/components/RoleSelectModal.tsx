'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  UtensilsCrossed,
  Shield,
  ArrowRight,
  Lock,
  User,
  X,
} from 'lucide-react';
import { RESTAURANT_NAME } from '@/data/menuData';

interface RoleSelectModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const RoleSelectModal: React.FC<RoleSelectModalProps> = ({
  forceOpen = false,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Listen for custom trigger to reopen modal anytime
    const handleCustomOpen = () => setIsOpen(true);
    window.addEventListener('dawat_open_role_modal', handleCustomOpen);

    // If we're already on the admin page, do not pop up automatically
    if (pathname && pathname.startsWith('/admin')) {
      setIsOpen(false);
      return () => {
        window.removeEventListener('dawat_open_role_modal', handleCustomOpen);
      };
    }

    // Force open if requested via prop
    if (forceOpen) {
      setIsOpen(true);
      return () => {
        window.removeEventListener('dawat_open_role_modal', handleCustomOpen);
      };
    }

    // Check if query param requests role select
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('select_role') || params.get('role') === 'select') {
        sessionStorage.removeItem('dawat_selected_role');
        setIsOpen(true);
        return () => {
          window.removeEventListener('dawat_open_role_modal', handleCustomOpen);
        };
      }
    }

    // Check if the user already made a selection in this session
    const selectedRole = sessionStorage.getItem('dawat_selected_role');
    if (!selectedRole) {
      // Small timeout so the page animation finishes before popup appears smoothly
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 250);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('dawat_open_role_modal', handleCustomOpen);
      };
    }

    return () => {
      window.removeEventListener('dawat_open_role_modal', handleCustomOpen);
    };
  }, [forceOpen, pathname]);

  const handleSelectCustomer = () => {
    sessionStorage.setItem('dawat_selected_role', 'customer');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSelectAdmin = () => {
    sessionStorage.setItem('dawat_selected_role', 'admin');
    setIsOpen(false);
    if (onClose) onClose();
    router.push('/admin');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-[#0b0f19] border border-amber-500/30 rounded-3xl shadow-2xl p-6 sm:p-10 text-stone-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleSelectCustomer}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-2 rounded-full hover:bg-stone-850 transition-colors z-20"
          title="Continue as Customer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Subtle decorative glowing background */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center max-w-lg mx-auto relative z-10 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-stone-950 shadow-lg shadow-amber-950/50 mb-4">
            <UtensilsCrossed className="w-7 h-7" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">
            Welcome to {RESTAURANT_NAME}
          </h2>
          <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mt-1">
            Aap Website Kis Tour Par Use Karna Chahte Hain?
          </p>
          <p className="text-stone-400 text-xs sm:text-sm mt-2">
            Please choose how you would like to enter the portal:
          </p>
        </div>

        {/* 2 Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          
          {/* 1. CUSTOMER / USER CARD */}
          <button
            type="button"
            onClick={handleSelectCustomer}
            className="group text-left p-6 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/60 transition-all duration-300 shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Customer
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                I am a Customer / User
              </h3>
              <p className="text-xs text-amber-300/80 font-semibold mt-0.5">
                Main Khana Order Karna Chahta Hoon
              </p>
              <p className="text-xs text-stone-400 mt-2.5 leading-relaxed">
                Explore authentic Pakistani dishes, order online in PKR, and track live order progress like Daraz.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
              <span>Enter as Customer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 2. ADMIN CARD */}
          <button
            type="button"
            onClick={handleSelectAdmin}
            className="group text-left p-6 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-orange-500/60 transition-all duration-300 shadow-xl hover:shadow-orange-500/10 flex flex-col justify-between hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-500 group-hover:text-stone-950 transition-all">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Admin Only
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                I am the Admin
              </h3>
              <p className="text-xs text-orange-300/80 font-semibold mt-0.5">
                Main Restaurant Admin Hoon
              </p>
              <p className="text-xs text-stone-400 mt-2.5 leading-relaxed">
                Access restaurant orders console, monitor incoming orders, and change cooking & delivery status.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs font-bold text-orange-400 group-hover:text-orange-300">
              <span>Login as Admin</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-5 border-t border-stone-800/80 text-center relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500">
          <span>Aap baad mein bhi footer se role switch kar sakte hain.</span>
          <button
            type="button"
            onClick={handleSelectCustomer}
            className="text-stone-400 hover:text-amber-400 underline underline-offset-2 transition-colors"
          >
            Skip to Homepage &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
