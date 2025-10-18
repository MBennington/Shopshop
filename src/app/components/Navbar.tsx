'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3 sticky top-0 bg-white z-50 shadow-sm">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 text-[#0d141c]">
          <Link
            href="/"
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            <div className="size-4">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">
              Marketplace
            </h2>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-9">
          {[
            { label: 'Home', path: '/' },
            { label: 'Categories', path: '/categories' },
            { label: 'Deals', path: '/deals' },
            { label: 'New Arrivals', path: '/new-arrivals' },
            { label: 'Shops', path: '/shops' },
          ].map(({ label, path }) => (
            <Link
              key={label}
              href={path}
              className={`px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium leading-normal ${
                pathname === path || (path !== '/' && pathname.startsWith(path))
                  ? 'bg-black text-white'
                  : 'bg-[#f1f2f3] text-[#0d141c] hover:bg-[#e3eaf6] hover:text-black'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Search and User Controls */}
      <div className="flex flex-1 justify-end gap-8">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col min-w-40 !h-10 max-w-64"
        >
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-[#49739c] flex border-none bg-[#e7edf4] items-center justify-center pl-4 rounded-l-lg border-r-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <input
              placeholder="Search"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-full placeholder:text-[#49739c] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Wishlist and Cart */}
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/wishlist')}
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#e7edf4] text-[#0d141c] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-[#d1dbe9] transition-colors"
            aria-label="Favorites"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill={pathname.startsWith('/wishlist') ? '#e53935' : 'none'}
              stroke="#e53935"
              strokeWidth="2"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
          <button
            onClick={() => router.push('/cart')}
            className={`flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 transition-colors ${
              pathname.startsWith('/cart')
                ? 'bg-black'
                : 'bg-[#e7edf4] hover:bg-[#d1dbe9]'
            }`}
            aria-label="Shopping Cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20px"
              height="20px"
              viewBox="0 0 256 256"
              fill={pathname.startsWith('/cart') ? '#90caf9' : 'none'}
              stroke={pathname.startsWith('/cart') ? '#fff' : '#154178'}
              strokeWidth="2"
            >
              <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Z" />
            </svg>
          </button>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#397fc5]"></div>
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0d141c] bg-[#e7edf4] rounded-lg hover:bg-[#d1dbe9] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#397fc5] flex items-center justify-center">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
                <FiChevronDown className="w-3 h-3" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#dde0e3] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#dde0e3]">
                    <p className="text-sm font-medium text-[#121416]">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#6a7581]">{user.email}</p>
                    {user.role === 'seller' &&
                      user.sellerInfo?.businessName && (
                        <p className="text-xs text-[#397fc5]">
                          {user.sellerInfo?.businessName}
                        </p>
                      )}
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push(
                        user.role === 'seller' ? '/sell/settings' : '/profile'
                      );
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-[#6a7581] hover:bg-[#f7f8fa] transition-colors"
                  >
                    <FiUser className="inline w-4 h-4 mr-2" />
                    Profile Settings
                  </button>

                  {user.role === 'seller' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/sell');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#6a7581] hover:bg-[#f7f8fa] transition-colors"
                    >
                      Seller Dashboard
                    </button>
                  )}

                  <div className="border-t border-[#dde0e3] mt-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut className="inline w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => router.push('/auth')}
                className="px-4 py-2 text-sm font-medium text-[#0d141c] bg-[#e7edf4] rounded-lg hover:bg-[#d1dbe9] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0d141c] rounded-lg hover:bg-[#1a2332] transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
