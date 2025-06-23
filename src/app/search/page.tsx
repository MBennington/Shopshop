"use client";
import { useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Mock shops/products (copy from shops/[id]/page.tsx for demo)
const shops = [
  {
    id: '1',
    name: 'Urban Styles',
    description: 'Trendy urban fashion and accessories for all ages.',
    owner: 'Alice Johnson',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
    products: [
      { id: 'p1', name: 'Denim Jacket', price: '$49.99', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', category: 'Fashion' },
      { id: 'p2', name: 'Graphic Tee', price: '$19.99', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', category: 'Fashion' },
    ],
  },
  {
    id: '2',
    name: 'Eco Home',
    description: 'Eco-friendly home goods and sustainable living products.',
    owner: 'Bob Smith',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    products: [
      { id: 'p3', name: 'Bamboo Toothbrush', price: '$3.99', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', category: 'Home' },
    ],
  },
  {
    id: '3',
    name: 'Gadget Galaxy',
    description: 'Latest gadgets, electronics, and tech accessories.',
    owner: 'Charlie Lee',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    products: [
      { id: 'p4', name: 'Wireless Earbuds', price: '$29.99', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', category: 'Tech' },
    ],
  },
];

const allCategories = ['All', 'Fashion', 'Home', 'Tech'];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query')?.toLowerCase() || '';

  // Flatten all products from all shops
  const allProducts = useMemo(() => shops.flatMap(shop => shop.products.map(p => ({ ...p, shopName: shop.name }))), []);

  // Filters state
  const [category, setCategory] = useState('All');
  const [shop, setShop] = useState('All');
  const [sort, setSort] = useState('relevance');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState(null as null | any);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ripple, setRipple] = useState<{[id: string]: {x: number, y: number} | null}>({});

  // Simulate loading
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, [query, category, shop, sort, priceMin, priceMax]);

  // Filtered products
  let filtered = allProducts.filter(p =>
    (!query || p.name.toLowerCase().includes(query)) &&
    (category === 'All' || p.category === category) &&
    (shop === 'All' || p.shopName === shop) &&
    (!priceMin || Number(p.price.replace(/[^\d.]/g, '')) >= Number(priceMin)) &&
    (!priceMax || Number(p.price.replace(/[^\d.]/g, '')) <= Number(priceMax))
  );
  if (sort === 'price-asc') filtered = filtered.sort((a, b) => Number(a.price.replace(/[^\d.]/g, '')) - Number(b.price.replace(/[^\d.]/g, '')));
  if (sort === 'price-desc') filtered = filtered.sort((a, b) => Number(b.price.replace(/[^\d.]/g, '')) - Number(a.price.replace(/[^\d.]/g, '')));
  if (sort === 'newest') filtered = filtered.reverse();

  // Trending products (if no query)
  const trending = allProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[#131416]">{query ? `Search Results for "${query}"` : 'Discover Products'}</h1>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 items-end">
          {/* Category pills */}
          <div className="flex gap-2">
            {allCategories.map(cat => (
              <button
                key={cat}
                className={`px-5 py-2 rounded-full font-medium text-base transition-all duration-200 shadow-sm
                  ${category === cat ? 'bg-black text-white' : 'bg-[#f1f2f3] text-[#131416] hover:bg-[#e3eaf6] hover:text-black'}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Shop filter */}
          <div>
            <select
              className="rounded-full px-4 py-2 bg-[#f1f2f3] text-[#131416] border-none shadow-sm focus:ring-2 focus:ring-[#1976d2]"
              value={shop}
              onChange={e => setShop(e.target.value)}
            >
              <option value="All">All Shops</option>
              {shops.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          {/* Price filter */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-20 rounded-full px-3 py-2 bg-[#f1f2f3] text-[#131416] border-none shadow-sm focus:ring-2 focus:ring-[#1976d2]"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              min={0}
            />
            <span className="text-[#6c757f]">-</span>
            <input
              type="number"
              placeholder="Max"
              className="w-20 rounded-full px-3 py-2 bg-[#f1f2f3] text-[#131416] border-none shadow-sm focus:ring-2 focus:ring-[#1976d2]"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              min={0}
            />
          </div>
          {/* Sort dropdown */}
          <div>
            <select
              className="rounded-full px-4 py-2 bg-[#f1f2f3] text-[#131416] border-none shadow-sm focus:ring-2 focus:ring-[#1976d2]"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
        {/* Trending section if no query */}
        {!query && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-[#1976d2]">Trending Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {trending.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-start transition-all duration-300 ease-out transform hover:shadow-2xl hover:scale-[1.035] group cursor-pointer" style={{ boxShadow: '0 1px 4px rgba(60,60,60,0.08)' }}>
                  <div className="w-full aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-gray-100 relative">
                    <img src={product.image} alt={product.name} className="object-cover w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="w-full">
                    <p className="text-[#131416] text-lg font-semibold leading-normal mb-1 text-left tracking-tight">{product.name}</p>
                    <p className="text-[#6c757f] text-base font-medium leading-normal text-left">{product.price}</p>
                    <p className="text-xs text-[#1976d2] mt-1">{product.shopName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Search results or skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#f1f2f3] rounded-2xl p-4 animate-pulse flex flex-col items-start">
                <div className="w-full aspect-square mb-4 rounded-xl bg-[#e3eaf6]" />
                <div className="h-5 w-3/4 rounded bg-[#e3eaf6] mb-2" />
                <div className="h-4 w-1/2 rounded bg-[#e3eaf6] mb-1" />
                <div className="h-3 w-1/3 rounded bg-[#e3eaf6]" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-[#6c757f] text-lg py-20">No products found. Try a different search or adjust your filters.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-[#e3eaf6] shadow-md p-4 flex flex-col items-start transition-all duration-300 ease-out transform hover:shadow-2xl hover:scale-[1.04] group cursor-pointer relative overflow-visible" style={{ boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)' }}>
                {/* Wishlist icon */}
                <button
                  className="absolute top-3 left-3 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-white transition-colors"
                  onClick={e => {
                    e.stopPropagation();
                    setWishlist(w => w.includes(product.id) ? w.filter(id => id !== product.id) : [...w, product.id]);
                    // Sync to localStorage
                    setTimeout(() => localStorage.setItem('wishlist', JSON.stringify(wishlist.includes(product.id) ? wishlist.filter(id => id !== product.id) : [...wishlist, product.id])), 0);
                  }}
                  aria-label="Add to wishlist"
                >
                  {wishlist.includes(product.id) ? (
                    <svg width="22" height="22" fill="#e53935" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  ) : (
                    <svg width="22" height="22" fill="none" stroke="#e53935" strokeWidth="2" viewBox="0 0 24 24"><path d="M12.1 8.64l-.1.1-.11-.11C10.14 6.6 7.1 7.24 5.6 9.28c-1.5 2.04-0.44 5.12 3.4 8.36l2.1 1.92 2.1-1.92c3.84-3.24 4.9-6.32 3.4-8.36-1.5-2.04-4.54-2.68-6.29-0.64z"/></svg>
                  )}
                </button>
                {/* Quick View icon */}
                <button
                  className="absolute top-3 right-3 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-white transition-colors"
                  onClick={e => { e.stopPropagation(); setQuickView(product); }}
                  aria-label="Quick view"
                >
                  <svg width="22" height="22" fill="#1976d2" viewBox="0 0 24 24"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12c-4.41 0-8-3.59-8-5s3.59-5 8-5 8 3.59 8 5-3.59 5-8 5zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
                </button>
                <div className="w-full aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-gray-100 relative">
                  <img src={product.image} alt={product.name} className="object-cover w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 rounded-xl transition-all duration-300 group-hover:bg-black/10 pointer-events-none" />
                  {/* Add to Cart with ripple */}
                  <button
                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#1976d2] text-white rounded-full px-5 py-2 shadow-lg text-xs font-semibold tracking-wide hover:bg-[#1565c0] focus:outline-none overflow-hidden"
                    style={{ boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)', position: 'absolute' }}
                    onClick={e => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setRipple(r => ({ ...r, [product.id]: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY } }));
                      setTimeout(() => setRipple(r => ({ ...r, [product.id]: null })), 500);
                    }}
                  >
                    Add to Cart
                    {ripple[product.id] && (
                      <span
                        className="absolute rounded-full bg-white/60 animate-ripple"
                        style={{
                          left: ripple[product.id]!.x - 40,
                          top: ripple[product.id]!.y - 40,
                          width: 80,
                          height: 80,
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </button>
                </div>
                <div className="w-full mb-2">
                  <p className="text-[#131416] text-xl font-bold leading-tight mb-1 text-left tracking-tight">{product.name}</p>
                  <p className="text-[#1976d2] text-lg font-semibold leading-normal text-left">{product.price}</p>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-2 w-full">
                  <div className="w-7 h-7 rounded-full bg-[#e3eaf6] flex items-center justify-center text-xs font-bold text-[#1976d2]">
                    {product.shopName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-xs text-[#6c757f] font-medium">{product.shopName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Ripple animation CSS */}
      <style jsx global>{`
        .animate-ripple {
          animation: ripple 0.5s linear;
          z-index: 10;
        }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.7; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
      {quickView && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setQuickView(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-[#6c757f] hover:text-[#1976d2] text-xl" onClick={() => setQuickView(null)} aria-label="Close">
              &times;
            </button>
            <div className="w-full aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-gray-100">
              <img src={quickView.image} alt={quickView.name} className="object-cover w-full h-full rounded-xl" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[#131416]">{quickView.name}</h2>
            <p className="text-lg text-[#1976d2] font-semibold mb-2">{quickView.price}</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#e3eaf6] flex items-center justify-center text-xs font-bold text-[#1976d2]">
                {quickView.shopName.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <span className="text-xs text-[#6c757f] font-medium">{quickView.shopName}</span>
            </div>
            <p className="text-[#6c757f] text-base mb-4">A beautiful product from {quickView.shopName}. (Add more details here.)</p>
            <button className="w-full py-3 rounded-full bg-[#1976d2] text-white font-bold text-base shadow hover:bg-[#1565c0] transition-colors">Add to Cart</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
} 