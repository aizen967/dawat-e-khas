'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Dish, CartItem } from '@/lib/types';
import { MENU_ITEMS } from '@/data/menuData';
import { Plus, Minus, Star, Clock, Utensils, Check, ArrowRight, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPKR } from '@/lib/currency';

interface MenuSectionProps {
  cart?: CartItem[];
  onAddToCart?: (dish: Dish) => void;
  onUpdateQuantity?: (dishId: string, quantity: number) => void;
  onJumpToCheckout?: () => void;
  isStandalonePage?: boolean;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  cart: propCart,
  onAddToCart: propAddToCart,
  onUpdateQuantity: propUpdateQuantity,
  onJumpToCheckout,
  isStandalonePage = false,
}) => {
  const globalCart = useCart();
  const cart = propCart ?? globalCart.cart;
  const onAddToCart = propAddToCart ?? globalCart.addToCart;
  const onUpdateQuantity = propUpdateQuantity ?? globalCart.updateQuantity;

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Biryani & Rice',
    'Karahi & Handi',
    'BBQ & Kebabs',
    'Traditional Gravies',
    'Tandoor & Breads',
    'Desserts & Drinks',
  ];

  const filteredDishes = MENU_ITEMS.filter((dish) => {
    const matchesCategory = activeCategory === 'All' || dish.category === activeCategory;
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDishQuantityInCart = (dishId: string): number => {
    const item = cart.find((i) => i.dish.id === dishId);
    return item ? item.quantity : 0;
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section id="menu" className={`py-16 sm:py-20 bg-stone-100 text-stone-900 scroll-mt-20 ${isStandalonePage ? 'min-h-screen' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-amber-700 text-xs sm:text-sm font-bold tracking-widest uppercase mb-2">
            <Utensils className="w-4 h-4" />
            <span>Royal Pakistani Flavors</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-stone-900">
            Our Authentic Pakistani Menu
          </h2>
          <p className="mt-3 text-stone-600 text-base sm:text-lg">
            Prepared fresh to order using 100% Halal cuts, authentic desi ghee, charcoal tandoors, and heritage Mughlai spices. Prices listed in Pakistani Rupee (PKR).
          </p>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Biryani, Karahi, Naan)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 shadow-xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-105'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Grid */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <Utensils className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-stone-800">No dishes match your search</h3>
            <p className="text-sm text-stone-500 mt-1">Try searching for a different keyword or category.</p>
            <button
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => {
              const qty = getDishQuantityInCart(dish.id);
              const isInCart = qty > 0;

              return (
                <div
                  key={dish.id}
                  className={`group flex flex-col justify-between bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    isInCart
                      ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                      : 'border-stone-200 hover:border-amber-400/60 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Dish Image Container */}
                    <div className="relative h-48 w-full overflow-hidden bg-stone-200">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/dishes/biryani.jpg';
                        }}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                      {/* Badge */}
                      {dish.badge && (
                        <span className="absolute top-3 left-3 bg-amber-500 text-stone-950 font-bold text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                          {dish.badge}
                        </span>
                      )}

                      {/* Rating Pill */}
                      <span className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-sm text-amber-400 font-bold text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {dish.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Dish Details */}
                    <div className="p-5">
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{dish.prepTime}</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-amber-700 font-medium">{dish.category}</span>
                      </div>

                      <h3 className="text-lg font-serif font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                        {dish.name}
                      </h3>

                      <p className="mt-1.5 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>
                  </div>

                  {/* Price in Pakistani Rupee (PKR / Rs.) and Cart Controls */}
                  <div className="p-5 pt-0 mt-auto">
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-medium text-stone-400 block uppercase tracking-wider">Price</span>
                        <span className="text-xl font-bold font-serif text-amber-700">
                          {formatPKR(dish.price)}
                        </span>
                      </div>

                      {/* Cart Controls */}
                      {isInCart ? (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl p-1 shadow-sm">
                          <button
                            onClick={() => onUpdateQuantity(dish.id, qty - 1)}
                            className="w-8 h-8 rounded-lg bg-white hover:bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-sm shadow-xs transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-amber-900">
                            {qty}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(dish.id, qty + 1)}
                            className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold text-sm shadow-xs transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddToCart(dish)}
                          className="flex items-center gap-1.5 bg-stone-900 hover:bg-amber-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner to Proceed to Order */}
        {totalCartCount > 0 && (
          <div className="mt-12 bg-amber-600 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold">
                  {totalCartCount} Pakistani Dish(es) in your cart
                </h4>
                <p className="text-amber-100 text-xs sm:text-sm">
                  Ready to provide your delivery address and confirm your order?
                </p>
              </div>
            </div>

            {onJumpToCheckout ? (
              <button
                onClick={onJumpToCheckout}
                className="bg-white hover:bg-stone-100 text-stone-900 font-bold px-6 py-3 rounded-xl text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Proceed to Order Form & Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/order"
                className="bg-white hover:bg-stone-100 text-stone-900 font-bold px-6 py-3 rounded-xl text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Proceed to Order Form & Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
