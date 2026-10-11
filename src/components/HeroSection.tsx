'use client';

import React from 'react';
import { Sparkles, ArrowRight, Clock, Star, ShieldCheck, ChefHat } from 'lucide-react';
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from '@/data/menuData';

interface HeroSectionProps {
  onExploreMenu: () => void;
  onOrderNow: () => void;
  onQuickAddFeatured: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreMenu,
  onOrderNow,
  onQuickAddFeatured,
}) => {
  return (
    <section id="hero" className="relative overflow-hidden bg-stone-950 text-white pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-96 h-96 bg-orange-700/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Main Hero Content (Left) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Michelin / Award Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-300 text-xs sm:text-sm font-medium tracking-wide shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>Culinary Excellence & Fine Dining • Est. 2018</span>
            </div>

            {/* Prominent Restaurant Name */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-stone-100 leading-[1.1]">
              Welcome to <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                {RESTAURANT_NAME}
              </span>
            </h1>

            {/* Tagline & Subheading */}
            <p className="text-lg sm:text-xl text-stone-300 max-w-2xl font-light leading-relaxed mx-auto lg:mx-0">
              {RESTAURANT_TAGLINE}. Authentic Karachi Dum Biryani, tender Shinwari Karahis, slow-simmered Nalli Nihari, and live charcoal seekh kebabs.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <button
                onClick={onOrderNow}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold px-7 py-4 rounded-xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-base"
              >
                <span>Order Now for Delivery</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExploreMenu}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-stone-900/90 hover:bg-stone-800 text-stone-200 font-semibold px-6 py-4 rounded-xl border border-stone-700/80 hover:border-stone-600 transition-all text-base"
              >
                <span>Explore Full Menu</span>
              </button>
            </div>

            {/* Highlights Bar */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-stone-800/80 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-stone-400">Speedy Prep</div>
                  <div className="text-sm font-semibold text-stone-200">25-35 Mins</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-400">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <div className="text-xs text-stone-400">Google Rating</div>
                  <div className="text-sm font-semibold text-stone-200">4.9 / 5.0 (1.4k+)</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-stone-400">Quality Assured</div>
                  <div className="text-sm font-semibold text-stone-200">100% Organic</div>
                </div>
              </div>
            </div>

          </div>

          {/* Hero Visual Card (Right) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative ring */}
              <div className="relative rounded-3xl overflow-hidden p-1 bg-gradient-to-b from-amber-500/40 via-stone-800 to-transparent shadow-2xl">
                <div className="relative rounded-[22px] overflow-hidden bg-stone-900">
                  <img
                    src="/images/dishes/karahi.jpg"
                    alt="Peshawari Mutton Shinwari Karahi"
                    className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                  {/* Card Floating Content */}
                  <div className="absolute bottom-0 inset-x-0 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-amber-500 text-stone-950 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1">
                        <ChefHat className="w-3.5 h-3.5" /> Chef Special
                      </span>
                      <span className="text-xl font-black text-amber-400">Rs. 2,450</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold font-serif text-white">Peshawari Mutton Shinwari Karahi</h3>
                      <p className="text-xs text-stone-300 line-clamp-2 mt-1">
                        Cooked in traditional iron wok with fresh tomatoes, ginger juliennes & green chilies in pure desi ghee.
                      </p>
                    </div>

                    <button
                      onClick={onQuickAddFeatured}
                      className="w-full py-2.5 px-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <span>+ Add Shinwari Karahi to Order</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating review card */}
              <div className="absolute -bottom-6 -left-6 bg-stone-900/90 backdrop-blur-md border border-stone-800 p-3.5 rounded-2xl shadow-xl hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  ★
                </div>
                <div>
                  <div className="text-xs font-bold text-white">"Best dining in town"</div>
                  <div className="text-[11px] text-stone-400">Verified Diner Review</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
