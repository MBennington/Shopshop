import React from 'react';
import { useParams } from 'next/navigation';

const shops = [
  {
    id: '1',
    name: 'Urban Styles',
    description: 'Trendy urban fashion and accessories for all ages.',
    owner: 'Alice Johnson',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
    products: [
      { id: 'p1', name: 'Denim Jacket', price: '$49.99', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
      { id: 'p2', name: 'Graphic Tee', price: '$19.99', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: '2',
    name: 'Eco Home',
    description: 'Eco-friendly home goods and sustainable living products.',
    owner: 'Bob Smith',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    products: [
      { id: 'p3', name: 'Bamboo Toothbrush', price: '$3.99', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  {
    id: '3',
    name: 'Gadget Galaxy',
    description: 'Latest gadgets, electronics, and tech accessories.',
    owner: 'Charlie Lee',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    products: [
      { id: 'p4', name: 'Wireless Earbuds', price: '$29.99', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80' },
    ],
  },
];

export default function ShopDetailsPage({ params }: { params: { id: string } }) {
  const shop = shops.find((s) => s.id === params.id);
  if (!shop) return <div className="p-10 text-center text-xl">Shop not found.</div>;

  return (
    <div className="min-h-screen bg-[#f7f8fa] py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-[#dde0e3] overflow-hidden">
        <div className="h-56 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
          <img src={shop.image} alt={shop.name} className="object-cover w-full h-full" />
        </div>
        <div className="p-8 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#121416]">{shop.name}</h1>
          <p className="text-[#6a7581] text-base mb-2">{shop.description}</p>
          <div className="flex items-center gap-2 pt-2 pb-4">
            <div className="w-8 h-8 rounded-full bg-[#397fc5] flex items-center justify-center text-white font-bold text-xs">{shop.owner.split(' ').map(n => n[0]).join('')}</div>
            <span className="text-xs text-[#397fc5] font-medium">{shop.owner}</span>
          </div>
          <h2 className="text-lg font-bold text-[#121416] mt-4 mb-2">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shop.products.map((product) => (
              <div key={product.id} className="bg-[#f7f8fa] rounded-xl p-4 flex flex-col items-center border border-[#dde0e3]">
                <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded mb-2" />
                <div className="font-bold text-[#121416]">{product.name}</div>
                <div className="text-[#397fc5] font-medium">{product.price}</div>
              </div>
            ))}
            {shop.products.length === 0 && <div className="col-span-2 text-center text-[#6a7581]">No products yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
} 