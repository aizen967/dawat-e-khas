'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Sparkles, Utensils, ShieldCheck, Heart, Award, ArrowRight } from 'lucide-react';
import { RESTAURANT_NAME } from '@/data/menuData';

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-stone-950 text-stone-100">
      <Navbar />

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Heritage & Culinary Philosophy</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif font-black text-white">
            The Story of {RESTAURANT_NAME}
          </h1>
          <p className="mt-4 text-stone-300 text-base sm:text-lg leading-relaxed">
            Preserving centuries-old royal Mughlai recipes, charcoal tandoor artistry, and authentic Desi flavors from Lahore Food Street and Peshawar.
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6 text-stone-300 leading-relaxed text-sm sm:text-base">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Centuries of Flavor, Perfected For Today
            </h2>
            <p>
              Founded with the aspiration to celebrate the royal gastronomy of the Mughal court and the vibrant flavors of Pakistan, <strong>Dawat-e-Khas</strong> uses only the freshest 100% Halal meats, pure desi ghee, and whole spices freshly ground every morning.
            </p>
            <p>
              From our 8-hour slow-simmered <em>Nalli Nihari</em> to our dum-sealed <em>Karachi Chicken Biryani</em> and iron-wok <em>Shinwari Mutton Karahis</em>, every dish pays homage to authentic heritage while delivering a fine-dining experience directly to your doorstep.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
                <div className="text-2xl font-serif font-bold text-amber-400">100%</div>
                <div className="text-xs text-stone-400 mt-1 font-semibold uppercase">Certified Halal</div>
              </div>
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
                <div className="text-2xl font-serif font-bold text-amber-400">4.9 / 5.0</div>
                <div className="text-xs text-stone-400 mt-1 font-semibold uppercase">Customer Rating</div>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
              alt="Restaurant Ambiance"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="bg-amber-600 text-stone-950 text-xs font-bold px-3 py-1 rounded-full uppercase">
                Royal Kitchen
              </span>
              <h3 className="text-lg font-serif font-bold text-white mt-2">
                Handcrafted With Passion Every Day
              </h3>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">Uncompromised Quality</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              We never cut corners. Only prime mutton, organic chicken, and cold-pressed pure desi ghee enter our kitchens.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">Live Charcoal Tandoor</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Our seekh kebabs and naan are baked fresh inside clay tandoors over natural charcoal for the signature smoky flavor.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">Award-Winning Recipes</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Voted best Pakistani dining experience by diners and connoisseurs across Lahore and Karachi.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 p-8 sm:p-12 rounded-3xl shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-serif font-black">
            Ready to Taste the Royal Difference?
          </h2>
          <p className="text-sm sm:text-base font-medium mt-2 max-w-xl mx-auto text-amber-950">
            Explore our rich menu of Biryanis, Karahis, and Kebabs and place your order in Pakistani Rupee.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/menu"
              className="px-6 py-3 bg-stone-950 text-white hover:bg-stone-900 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Browse Full Menu
            </Link>
            <Link
              href="/order"
              className="px-6 py-3 bg-white text-stone-950 hover:bg-stone-100 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <span>Order Online</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </section>

      <Footer />
    </main>
  );
}
