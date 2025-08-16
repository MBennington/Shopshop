'use client';
import { useState, useEffect } from 'react';

interface CartApiResponse {
  msg: string;
  data: CartResponse;
}

interface CartItem {
  product_id: string;
  productName: string;
  basePrice: number;
  category: string;
  images: string[];
  quantity: number;
  size?: string;
  color: string;
  subtotal: number;
}

interface CartResponse {
  _id: string;
  user_id: string;
  total: number;
  products_list: CartItem[];
}

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token'); // get token

        const res = await fetch(`http://localhost:5000/api/cart/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // send token
          },
        });

        const json: CartApiResponse = await res.json();

        if (!res.ok) throw new Error(json.msg || 'Failed to fetch cart');

        setCart(json.data); // ✅ use json.data
      } catch (error) {
        console.error('Failed to fetch cart', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) {
    return <div className="text-center py-20">Loading cart...</div>;
  }

  if (!cart || cart.products_list.length === 0) {
    return (
      <div className="min-h-screen bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-[#131416]">My Cart</h1>
          <div className="text-center text-[#6c757f] text-lg py-20">
            Your cart is empty. Start shopping and add products to your cart!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[#131416]">My Cart</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {cart.products_list.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#e3eaf6] shadow-md p-4 flex flex-col items-start transition-all duration-300 ease-out transform hover:shadow-2xl hover:scale-[1.04] group cursor-pointer relative overflow-visible"
              style={{
                boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)',
              }}
            >
              <div className="w-full aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-gray-100 relative">
                <img
                  src={item.images?.[0] || '/placeholder.png'}
                  alt={item.productName}
                  className="object-cover w-full h-full rounded-xl transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="w-full mb-2">
                <p className="text-[#131416] text-xl font-bold leading-tight mb-1 text-left tracking-tight">
                  {item.productName}
                </p>
                <p className="text-[#1976d2] text-lg font-semibold leading-normal text-left">
                  LKR {item.basePrice.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Qty: {item.quantity} {item.size ? ` Size: ${item.size}` : ''}{' '}
                  {item.color ? (
                    <span
                      className="ml-2 inline-block w-4 h-4 rounded-full border"
                      style={{ backgroundColor: item.color }}
                    />
                  ) : null}
                </p>
                <p className="text-sm text-gray-800 font-medium mt-1">
                  Subtotal: LKR {item.subtotal.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-right mb-6">
          <p className="text-xl font-bold">
            Total: LKR {cart.total.toFixed(2)}
          </p>
        </div>

        <button className="w-full py-4 rounded-full bg-[#1976d2] text-white font-bold text-lg shadow hover:bg-[#1565c0] transition-colors">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
