'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';

// Sample product data - in a real app, this would come from an API
const products = [
  {
    id: 1,
    name: 'Smart Watch',
    description: 'Stay connected in style',
    price: 199.99,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsxvTrrvArtJFhC3K1rvLvZaMWH6PA5yL2A0wqOmppyOSUkjkkDE5qmT3_B_0B_0SC5ubr5oYZ-NA4ck_58BDv8eCtUQwf5tI2TtsJVmb7wxOEBjB15C8U58kLArUNkIheRhNKseubLGRpGp77Ohx9i70QghTqDigjaarQxnA_38a_mCqXekL9KdoylVEZ_JhxClLlWmnxl_9sISr6_Ehwj1Ye9S0JzRJr_28OCPL3ylID9GwS2-LubWU3MZAfyQpKZ0IFtJuQwyU'
  },
  {
    id: 2,
    name: 'Wireless Headphones',
    description: 'Immersive sound experience',
    price: 149.99,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnrrWa4KCDu1oJBzrKMjjG17DzG3xgrFMDQmFmxiLjlgYAkP4DrKwFPzjZivw_loSPuhVujN89p3hG6ifcMCO__fkRCLjkfLq20kz4POxDTCUzPMHivJlBplJt4ktvqHKRA9O8CvSZxZSWj9hOKGnnby_NfYNZ4uumQnUnxkpZvj2bbJJdpiuGbTqBfASqVltR0bCTDSmWOv1cB1VQLfF4tTGrTxLq_KoTmCyoz4lrYAGqou7vbA5y5xpvwdsHwjsKkbXbKWcS5eo'
  },
  {
    id: 3,
    name: 'Leather Handbag',
    description: 'Elegant and spacious',
    price: 299.99,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9OLWsQz9Hb9BW9iEx8TWZDfO-CTxMuT5UKcDuTxJin0jNwhtnbzSLMrLJCfMPwlb5PXnp8Eq6XjwX_sBilUin8O11r8u12fd1n38_N7eq-t96_klNTsUhEBSJyVDxhOyKFFI6OsbNxPHLbt0IC-rUEDFORIkOEOVhF_CrCHDFGg07pkcHRHITMN-lpFwLwMpYA5tKTbomewL3HczjNcHQxQHjpTlUWJVYFyImeaZU2v4kM75lVogozXtRjGTroOduqa1ZxRYEA3c'
  },
  {
    id: 4,
    name: 'Running Shoes',
    description: 'Comfort and performance',
    price: 129.99,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5ZmRDNKyOSYfQwkAxbDTfhFpcTdVjkiWvI8Rth1vFTaN1BPNdT57NZ6FuLrWqFtqxabdmYvgUTmdT23yV-KNQICi7gijGLEz8qxJcfrZP1PHQ1ECaH3LahptsL62IMASLerOVK67enyeQvPA2oTEu9fB25NdBNMKtUfOIGBhdjOPhMxuT4FyGeE4FSUJ4pKp4-qy67xJNomzW45KyK2ESMEgAkn4-XP-MFAljNbHZPcljzRsal_XGJoWsg7tZTj6DiV6ECK0aDnA'
  },
  {
    id: 5,
    name: 'Smart Watch Pro',
    description: 'Advanced features for active lifestyle',
    price: 249.99,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsxvTrrvArtJFhC3K1rvLvZaMWH6PA5yL2A0wqOmppyOSUkjkkDE5qmT3_B_0B_0SC5ubr5oYZ-NA4ck_58BDv8eCtUQwf5tI2TtsJVmb7wxOEBjB15C8U58kLArUNkIheRhNKseubLGRpGp77Ohx9i70QghTqDigjaarQxnA_38a_mCqXekL9KdoylVEZ_JhxClLlWmnxl_9sISr6_Ehwj1Ye9S0JzRJr_28OCPL3ylID9GwS2-LubWU3MZAfyQpKZ0IFtJuQwyU'
  },
  {
    id: 6,
    name: 'Premium Headphones',
    description: 'Studio-quality sound',
    price: 199.99,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnrrWa4KCDu1oJBzrKMjjG17DzG3xgrFMDQmFmxiLjlgYAkP4DrKwFPzjZivw_loSPuhVujN89p3hG6ifcMCO__fkRCLjkfLq20kz4POxDTCUzPMHivJlBplJt4ktvqHKRA9O8CvSZxZSWj9hOKGnnby_NfYNZ4uumQnUnxkpZvj2bbJJdpiuGbTqBfASqVltR0bCTDSmWOv1cB1VQLfF4tTGrTxLq_KoTmCyoz4lrYAGqou7vbA5y5xpvwdsHwjsKkbXbKWcS5eo'
  }
];

export default function ProductCatalogue({ params }: { params: Promise<{ category: string }> }) {
  const unwrappedParams = use(params);
  const category = unwrappedParams.category;
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 500]);

  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="px-4 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          {/* Category Header */}
          <div className="px-4 py-3">
            <h1 className="text-[#0d141c] text-2xl font-bold leading-tight tracking-[-0.015em] mb-4">{categoryName}</h1>
            
            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <div className="flex items-center gap-2">
                <label className="text-[#0d141c] text-sm font-medium">Sort by:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-[#e7edf4] bg-white px-3 py-1.5 text-sm text-[#0d141c] focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-[#0d141c] text-sm font-medium">Price Range:</label>
                <input 
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-32"
                />
                <span className="text-[#49739c] text-sm">${priceRange[0]} - ${priceRange[1]}</span>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${category}/${product.id}`} className="flex flex-col gap-4 rounded-lg min-w-40">
                  <div className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl flex flex-col" style={{ backgroundImage: `url('${product.image}')` }} />
                  <div>
                    <p className="text-[#121417] text-base font-medium leading-normal">{product.name}</p>
                    <p className="text-[#687582] text-sm font-normal leading-normal">{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 