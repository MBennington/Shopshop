"use client";
import { useState, useEffect, useMemo } from 'react';

// Mock shops/products (copy from wishlist/search page)
const shops = [
  {
    id: '1',
    name: 'Urban Styles',
    products: [
      { id: 'p1', name: 'Denim Jacket', price: '$49.99', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', category: 'Fashion' },
      { id: 'p2', name: 'Graphic Tee', price: '$19.99', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', category: 'Fashion' },
    ],
  },
  {
    id: '2',
    name: 'Eco Home',
    products: [
      { id: 'p3', name: 'Bamboo Toothbrush', price: '$3.99', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', category: 'Home' },
    ],
  },
  {
    id: '3',
    name: 'Gadget Galaxy',
    products: [
      { id: 'p4', name: 'Wireless Earbuds', price: '$29.99', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', category: 'Tech' },
    ],
  },
];

export default function CartPage() {
  // For demo, cart is empty
  const [cart, setCart] = useState<string[]>([]);

  // Example: to add mock items, uncomment below
  // useEffect(() => { setCart(["p1", "p3"]); }, []);

  const allProducts = useMemo(() => shops.flatMap(shop => shop.products.map(p => ({ ...p, shopName: shop.name }))), []);
  const cartItems = allProducts.filter(p => cart.includes(p.id));

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[#131416]">My Cart</h1>
        {cartItems.length === 0 ? (
          <div className="text-center text-[#6c757f] text-lg py-20">Your cart is empty. Start shopping and add products to your cart!</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              {cartItems.map(product => (
                <div key={product.id} className="bg-white rounded-2xl border border-[#e3eaf6] shadow-md p-4 flex flex-col items-start transition-all duration-300 ease-out transform hover:shadow-2xl hover:scale-[1.04] group cursor-pointer relative overflow-visible" style={{ boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)' }}>
                  <div className="w-full aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-gray-100 relative">
                    <img src={product.image} alt={product.name} className="object-cover w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-110" />
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
            <button className="w-full py-4 rounded-full bg-[#1976d2] text-white font-bold text-lg shadow hover:bg-[#1565c0] transition-colors">Proceed to Checkout</button>
          </>
        )}
      </div>
    </div>
  );
} 