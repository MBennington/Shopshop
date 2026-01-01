'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiShoppingBag,
  FiHeart,
  FiSearch,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { Gift } from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
    { label: 'Deals', path: '/deals' },
    { label: 'New Arrivals', path: '/new-arrivals' },
    { label: 'Shops', path: '/shops' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FF0808] border-b border-white/10 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-6 md:gap-10">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105"
            >
              <div className="relative">
                <Image
                  src="/shipship.svg"
                  alt="ShipShip"
                  width={140}
                  height={42}
                  className="h-8 md:h-10 w-auto transition-opacity duration-300 group-hover:opacity-90"
                  priority
                />
              </div>
            </Link>

            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(({ label, path }) => {
                const isActive =
                  pathname === path ||
                  (path !== '/' && pathname.startsWith(path));
                return (
                  <Link
                    key={label}
                    href={path}
                    className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-white text-[#FF0808] shadow-lg scale-105'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 rounded-xl bg-white animate-pulse opacity-20"></span>
                    )}
                    <span className="relative z-10">{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <FiX size={24} className="animate-in fade-in" />
              ) : (
                <FiMenu size={24} className="animate-in fade-in" />
              )}
            </button>
          </div>

          {/* Right Section: Search, Actions, User */}
          <div className="flex items-center gap-3 md:gap-4 flex-1 justify-end max-w-2xl">
            {/* Enhanced Search Bar */}
            <form
              onSubmit={handleSearch}
              className={`flex-1 max-w-md transition-all duration-300 ${
                isSearchFocused ? 'scale-105' : ''
              }`}
            >
              <div
                className={`relative flex items-center rounded-full overflow-hidden transition-all duration-300 ${
                  isSearchFocused
                    ? 'bg-white shadow-2xl ring-2 ring-white/50'
                    : 'bg-white/15 backdrop-blur-md hover:bg-white/20'
                }`}
              >
                <div className="pl-4 pr-2 flex items-center">
                  <FiSearch
                    className={`transition-colors duration-300 ${
                      isSearchFocused ? 'text-[#FF0808]' : 'text-white/80'
                    }`}
                    size={18}
                  />
                </div>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`flex-1 py-2.5 px-2 text-sm font-medium bg-transparent border-0 outline-none transition-colors duration-300 ${
                    isSearchFocused
                      ? 'text-[#0d141c] placeholder:text-[#49739c]'
                      : 'text-white placeholder:text-white/60'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="submit"
                    className="mr-2 px-4 py-1.5 bg-[#FF0808] text-white text-xs font-semibold rounded-full hover:bg-[#E00000] transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Go
                  </button>
                )}
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Wishlist Button */}
              <button
                onClick={() => router.push('/wishlist')}
                className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  pathname.startsWith('/wishlist')
                    ? 'bg-white text-[#FF0808] shadow-lg scale-105'
                    : 'bg-white/15 text-white hover:bg-white/25 hover:scale-110'
                }`}
                aria-label="Wishlist"
              >
                <FiHeart
                  size={20}
                  className={
                    pathname.startsWith('/wishlist') ? 'fill-current' : ''
                  }
                />
                {pathname.startsWith('/wishlist') && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF0808] rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={() => router.push('/cart')}
                className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  pathname.startsWith('/cart')
                    ? 'bg-white text-[#FF0808] shadow-lg scale-105'
                    : 'bg-white/15 text-white hover:bg-white/25 hover:scale-110'
                }`}
                aria-label="Shopping Cart"
              >
                <FiShoppingBag size={20} />
                {pathname.startsWith('/cart') && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF0808] rounded-full animate-pulse"></span>
                )}
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              ) : user ? (
                <>
                  {/* Gift Cards Button */}
                  <button
                    onClick={() => {
                      // Don't navigate if on acceptance page - stay on acceptance page
                      if (pathname.startsWith('/gift-cards/accept')) {
                        return;
                      }
                      router.push('/gift-cards/landing');
                    }}
                    className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                      pathname.startsWith('/gift-cards') &&
                      !pathname.startsWith('/gift-cards/accept')
                        ? 'bg-white text-[#FF0808] shadow-lg scale-105'
                        : 'bg-white/15 text-white hover:bg-white/25 hover:scale-110'
                    }`}
                    aria-label="Gift Cards"
                  >
                    <Gift
                      size={20}
                      className={
                        pathname.startsWith('/gift-cards') &&
                        !pathname.startsWith('/gift-cards/accept')
                          ? 'fill-current'
                          : ''
                      }
                    />
                    {pathname.startsWith('/gift-cards') &&
                      !pathname.startsWith('/gift-cards/accept') && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF0808] rounded-full animate-pulse"></span>
                      )}
                  </button>

                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl hover:bg-white/95 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg group"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF0808] to-[#FF4040] flex items-center justify-center overflow-hidden ring-2 ring-white/50">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiUser className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="hidden md:inline text-sm font-semibold text-[#FF0808] max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <FiChevronDown
                        className={`w-4 h-4 text-[#FF0808] transition-transform duration-300 ${
                          showUserMenu ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Enhanced Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* User Info Header */}
                        <div className="px-4 py-4 bg-gradient-to-br from-[#FF0808] to-[#FF4040] text-white">
                          <p className="text-sm font-bold truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-white/90 truncate mt-0.5">
                            {user.email}
                          </p>
                          {user.role === 'seller' &&
                            user.sellerInfo?.businessName && (
                              <div className="mt-2 px-2 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                                <p className="text-xs font-medium truncate">
                                  {user.sellerInfo.businessName}
                                </p>
                              </div>
                            )}
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push(
                                user.role === 'seller'
                                  ? '/sell/settings'
                                  : '/profile'
                              );
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#FF0808]/5 hover:text-[#FF0808] transition-colors duration-200 flex items-center gap-3 group"
                          >
                            <FiUser className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Profile</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push('/my-orders');
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#FF0808]/5 hover:text-[#FF0808] transition-colors duration-200 flex items-center gap-3 group"
                          >
                            <FiShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">My Orders</span>
                          </button>

                          {user.role === 'seller' && (
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                router.push('/sell');
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#FF0808]/5 hover:text-[#FF0808] transition-colors duration-200 flex items-center gap-3 group"
                            >
                              <svg
                                className="w-4 h-4 group-hover:scale-110 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                              </svg>
                              <span className="font-medium">
                                Seller Dashboard
                              </span>
                            </button>
                          )}

                          {user.role === 'admin' && (
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                router.push('/admin');
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#FF0808]/5 hover:text-[#FF0808] transition-colors duration-200 flex items-center gap-3 group"
                            >
                              <svg
                                className="w-4 h-4 group-hover:scale-110 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                              <span className="font-medium">
                                Admin Dashboard
                              </span>
                            </button>
                          )}

                          <div className="border-t border-gray-100 my-1"></div>

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              logout();
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-3 group"
                          >
                            <FiLogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/auth')}
                    className="px-4 py-2 text-sm font-semibold text-white bg-white/15 hover:bg-white/25 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/auth')}
                    className="px-4 py-2 text-sm font-semibold text-[#FF0808] bg-white rounded-xl hover:bg-white/95 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-white/10 py-4 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col gap-2">
              {navItems.map(({ label, path }) => {
                const isActive =
                  pathname === path ||
                  (path !== '/' && pathname.startsWith(path));
                return (
                  <Link
                    key={label}
                    href={path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-white text-[#FF0808] shadow-lg'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
