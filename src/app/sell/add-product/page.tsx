'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';

interface ColorOption {
  id: string;
  color: string;
  images: File[];
}

export default function AddProductPage() {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<ColorOption[]>([]);

  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const addColor = () => {
    setColors(prev => [
      ...prev,
      { id: Math.random().toString(36).slice(2), color: '#cccccc', images: [] }
    ]);
  };

  const removeColor = (id: string) => {
    setColors(prev => prev.filter(c => c.id !== id));
  };

  const updateColor = (id: string, color: string) => {
    setColors(prev => prev.map(c => c.id === id ? { ...c, color } : c));
  };

  const handleImageChange = (id: string, files: FileList | null) => {
    if (!files) return;
    setColors(prev => prev.map(c =>
      c.id === id ? { ...c, images: Array.from(files) } : c
    ));
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#121416] mb-1">Add New Product</h1>
              <p className="text-[#6a7581]">Create a new product listing</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#121417] text-sm font-medium mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-[#121417] text-sm font-medium mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent"
                    placeholder="Enter price"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#121417] text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent"
                  rows={4}
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-[#121417] text-sm font-medium mb-2">
                  Category
                </label>
                <select className="w-full px-4 py-2 border border-[#dde0e3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent">
                  <option value="">Select a category</option>
                  <option value="clothing">Clothing</option>
                  <option value="accessories">Accessories</option>
                  <option value="shoes">Shoes</option>
                </select>
              </div>

              <div>
                <label className="block text-[#121417] text-sm font-medium mb-2">
                  Sizes
                </label>
                <div className="flex flex-wrap gap-3">
                  {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                    <label
                      key={size}
                      className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 cursor-pointer transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-[#121416] text-white border-[#121416]'
                          : 'border-[#dde0e4] text-[#121417] hover:bg-[#f7f8fa]'
                      }`}
                    >
                      {size}
                      <input
                        type="checkbox"
                        className="invisible absolute"
                        checked={selectedSizes.includes(size)}
                        onChange={() => handleSizeChange(size)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#121417] text-sm font-medium mb-2">
                  Colors
                </label>
                <div className="flex flex-col gap-4">
                  {colors.map((colorOption, idx) => (
                    <div key={colorOption.id} className="flex flex-col gap-2 border border-[#dde0e3] rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={colorOption.color}
                          onChange={e => updateColor(colorOption.id, e.target.value)}
                          className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
                        />
                        <span className="text-sm">{colorOption.color}</span>
                        <button type="button" onClick={() => removeColor(colorOption.id)} className="ml-auto text-[#ef4444] text-xs font-bold">Remove</button>
                      </div>
                      <div>
                        <label className="block text-[#121417] text-xs font-medium mb-1">Upload Images for this Color</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={e => handleImageChange(colorOption.id, e.target.files)}
                        />
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {colorOption.images.map((file, i) => (
                            <img
                              key={i}
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addColor} className="w-fit px-4 py-2 bg-[#121416] text-white rounded-lg hover:bg-[#2a2d30] transition-colors text-sm font-medium">+ Add Color</button>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-[#dde0e3] rounded-lg text-[#6a7581] hover:bg-[#f7f8fa]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#121416] text-white rounded-lg hover:bg-[#2a2d30] transition-colors"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 