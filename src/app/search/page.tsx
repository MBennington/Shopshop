"use client";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';

interface ProductRecord {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  colors?: Array<{
    colorCode: string;
    colorName: string;
    images: string[];
  }>;
  seller?: string;
}

interface ProductsResponse {
  status?: boolean;
  data?: {
    records: ProductRecord[];
    recordsTotal: number;
    recordsFiltered: number;
  };
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query')?.trim() || '';

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [page, setPage] = useState(1);
  const [quickView, setQuickView] = useState<null | (ProductRecord & { image: string; shopName: string })>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ripple, setRipple] = useState<{ [id: string]: { x: number; y: number } | null }>({});

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '12');
        if (query) params.set('search', query);
        if (category !== 'All') params.set('category', category);
        if (priceMin) params.set('priceMin', priceMin);
        if (priceMax) params.set('priceMax', priceMax);
        if (sort === 'price_asc') {
          params.set('order', 'asc');
          params.set('column', '1');
        } else if (sort === 'price_desc') {
          params.set('order', 'desc');
          params.set('column', '1');
        } else if (sort === 'newest') {
          params.set('sortBy', 'newest');
        }
        const res = await fetch(`/api/products?${params}`);
        if (cancelled) return;
        const data: ProductsResponse = await res.json();
        if (!res.ok) {
          setProducts([]);
          setRecordsTotal(0);
          return;
        }
        const records = data.data?.records ?? [];
        const total = data.data?.recordsTotal ?? 0;
        setProducts(records);
        setRecordsTotal(total);
      } catch {
        if (!cancelled) {
          setProducts([]);
          setRecordsTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, [query, category, sort, priceMin, priceMax, page]);

  const getProductImage = (p: ProductRecord) => {
    const firstColor = p.colors?.[0];
    const img = firstColor?.images?.[0];
    return img || '/placeholder-product.png';
  };

  const displayProducts = products.map((p) => ({
    ...p,
    id: p._id,
    image: getProductImage(p),
    shopName: 'Store',
    priceFormatted: `$${Number(p.price).toFixed(2)}`,
  }));

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[#131416]">
          {query ? `Search Results for "${query}"` : 'Discover Products'}
        </h1>
        <div className="flex flex-wrap gap-4 mb-8 items-end">
          <div className="flex gap-2">
            {['All', 'Fashion', 'Home', 'Electronics', 'Books', 'Sports & Outdoors', 'Beauty & Personal Care', 'Toys & Games', 'Food & Grocery'].map((cat) => (
              <button
                key={cat}
                className={`px-5 py-2 rounded-full font-medium text-base transition-all duration-200 shadow-sm ${
                  category === cat ? 'bg-black text-white' : 'bg-[#f1f2f3] text-[#131416] hover:bg-[#e3eaf6] hover:text-black'
                }`}
                onClick={() => { setCategory(cat); setPage(1); }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-20 rounded-full px-3 py-2 bg-[#f1f2f3] text-[#131416] border-none shadow-sm focus:ring-2 focus:ring-[#1976d2]"
              value={priceMin}
              onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
              min={0}
            />
            <span className="text-[#6c757f]">-</span>
            <input
              type="number"
              placeholder="Max"
              className="w-20 rounded-full px-3 py-2 bg-[#f1f2f3] text-[#131416] border-none shadow-sm focus:ring-2 focus:ring-[#1976d2]"
              value={priceMax}
              onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
              min={0}
            />
          </div>
          <div>
            <select
              className="rounded-full px-4 py-2 bg-[#f1f2f3] text-[#131416] border-none shadow-sm focus:ring-2 focus:ring-[#1976d2]"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

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
        ) : displayProducts.length === 0 ? (
          <div className="text-center text-[#6c757f] text-lg py-20">
            No products found. Try a different search or adjust your filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {displayProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product.category.toLowerCase().replace(/\s+/g, '-')}/${product._id}`}
                  className="bg-white rounded-2xl border border-[#e3eaf6] shadow-md p-4 flex flex-col items-start transition-all duration-300 ease-out transform hover:shadow-2xl hover:scale-[1.04] group cursor-pointer relative overflow-visible block"
                  style={{ boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)' }}
                >
                  <div className="w-full aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-gray-100 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="w-full mb-2">
                    <p className="text-[#131416] text-xl font-bold leading-tight mb-1 text-left tracking-tight">{product.name}</p>
                    <p className="text-[#1976d2] text-lg font-semibold leading-normal text-left">{product.priceFormatted}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-auto pt-2 w-full">
                    <span className="text-xs text-[#6c757f] font-medium">{product.shopName}</span>
                  </div>
                </Link>
              ))}
            </div>
            {recordsTotal > 12 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-lg bg-[#f1f2f3] disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="py-2 text-[#6c757f]">
                  Page {page} of {Math.ceil(recordsTotal / 12)}
                </span>
                <button
                  type="button"
                  disabled={page >= Math.ceil(recordsTotal / 12)}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-lg bg-[#f1f2f3] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {quickView &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setQuickView(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-[#6c757f] hover:text-[#1976d2] text-xl"
                onClick={() => setQuickView(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <div className="w-full aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                <img src={quickView.image} alt={quickView.name} className="object-cover w-full h-full rounded-xl" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-[#131416]">{quickView.name}</h2>
              <p className="text-lg text-[#1976d2] font-semibold mb-2">${Number(quickView.price).toFixed(2)}</p>
              <Link
                href={`/products/${quickView.category.toLowerCase().replace(/\s+/g, '-')}/${quickView._id}`}
                className="block w-full py-3 rounded-full bg-[#1976d2] text-white font-bold text-base shadow hover:bg-[#1565c0] transition-colors text-center"
              >
                View product
              </Link>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
