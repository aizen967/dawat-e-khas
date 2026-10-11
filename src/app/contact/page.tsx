'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { RESTAURANT_NAME } from '@/data/menuData';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen flex flex-col bg-stone-950 text-stone-100">
      <Navbar />

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Phone className="w-3.5 h-3.5" />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-black text-white">
            Contact & Table Reservations
          </h1>
          <p className="mt-3 text-stone-400 text-sm sm:text-base">
            Have questions about our dishes, catering inquiries, or looking to reserve a private dining hall at {RESTAURANT_NAME}? We are at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Location & Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-5">
              <h3 className="font-serif font-bold text-xl text-white">Our Locations</h3>
              
              <div className="space-y-4 text-xs text-stone-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white text-sm block">Lahore Flagship Branch:</strong>
                    <span>Plot 12-C, MM Alam Road, Gulberg III, Lahore, Pakistan</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white text-sm block">Islamabad Royal Kitchen:</strong>
                    <span>Shop 4, Block 8, F-7 Markaz, Islamabad, Pakistan</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white text-sm block">Operating Hours:</strong>
                    <span>Monday - Sunday: 12:00 PM - 12:00 Midnight (Open Daily)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white text-sm block">Kitchen Hotlines:</strong>
                    <span>+92 42 35789100 / 0300-1234567</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white text-sm block">Direct Email:</strong>
                    <span>orders@dawat-e-khas.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Guarantee Card */}
            <div className="p-6 rounded-3xl bg-amber-600/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <strong className="text-amber-400 text-sm block">🚚 Fast Hot Food Delivery</strong>
              <p className="leading-relaxed">
                All food is dispatched in thermal-insulated containers directly from our tandoors and karahi woks, ensuring pipingly hot meals arrive within 30-40 minutes.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8">
            <h3 className="font-serif font-bold text-xl text-white mb-6">Send Us a Message / Inquiry</h3>

            {submitted ? (
              <div className="text-center py-12 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white">Message Received!</h4>
                <p className="text-xs text-stone-300 mt-1 max-w-sm mx-auto">
                  Thank you, {formData.name}. Our hospitality manager will contact you at {formData.phone} shortly.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: '', phone: '', email: '', message: '' }); }}
                  className="mt-4 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-xs font-bold rounded-xl text-stone-200"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 0300-1234567"
                      className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. customer@example.com"
                      className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold uppercase tracking-wider mb-1.5">
                    Your Message / Catering Request
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your event, table booking details, or dietary questions..."
                    className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
