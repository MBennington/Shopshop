'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '../../components/Sidebar';

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface ColorOption {
  id: string;
  color: string;
  images: File[];
  existingImages: string[];
  sizeQuantities: SizeQuantity[];
  quantity?: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  hasSizes: boolean;
  colors: Array<{
    colorCode: string;
    colorName: string;
    images: string[];
    sizes: Array<{
      size: string;
      quantity: number;
    }>;
    quantity: number;
  }>;
  status: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [hasSizes, setHasSizes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
  const CATEGORIES = [
    'Fashion',
    'Home & Living',
    'Electronics',
    'Books',
    'Sports & Outdoors',
    'Beauty & Personal Care',
    'Toys & Games',
    'Food & Grocery',
    'Other',
  ];

  // Fetch product data on component mount
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      const productData = data.data;
      setProduct(productData);

      // Pre-populate form fields
      setName(productData.name);
      setPrice(String(productData.price));
      setDescription(productData.description);
      setCategory(productData.category);
      setHasSizes(productData.hasSizes);

      // Pre-populate colors
      const populatedColors: ColorOption[] = productData.colors.map((color: any, index: number) => ({
        id: Math.random().toString(36).slice(2),
        color: color.colorCode,
        images: [],
        existingImages: color.images || [],
        sizeQuantities: hasSizes 
          ? color.sizes?.map((size: any) => ({ size: size.size, quantity: size.quantity })) || SIZES.map(size => ({ size, quantity: 0 }))
          : SIZES.map(size => ({ size, quantity: 0 })),
        quantity: color.quantity || 0,
      }));

      setColors(populatedColors);
    } catch (err: any) {
      setErrors({ fetch: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!price || Number(price) <= 0)
      newErrors.price = 'Valid price is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!category) newErrors.category = 'Category is required';

    if (colors.length === 0) {
      newErrors.colors = 'At least one color is required';
    }

    if (hasSizes) {
      const hasValidQuantity = colors.some((color) =>
        color.sizeQuantities.some((sq) => sq.quantity > 0)
      );
      if (!hasValidQuantity)
        newErrors.quantities = 'At least one quantity must be greater than 0';
    } else {
      const hasValidQuantity = colors.some(
        (color) => (color.quantity || 0) > 0
      );
      if (!hasValidQuantity)
        newErrors.quantities = 'At least one quantity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData();
    
    // Basic product information
    formData.append('name', name.trim());
    formData.append('price', String(Number(price)));
    formData.append('description', description.trim());
    formData.append('category', category);
    formData.append('hasSizes', String(hasSizes));
    
    // Product metadata
    formData.append(
      'totalImages',
      String(colors.reduce((total, color) => total + color.images.length, 0))
    );
    formData.append('totalColors', String(colors.length));
    formData.append('totalSizes', String(hasSizes ? 5 : 0));

    // Always send colors (every product has colors)
    colors.forEach((color, colorIndex) => {
      // Color information
      formData.append(`colors[${colorIndex}][colorCode]`, color.color);
      formData.append(`colors[${colorIndex}][colorName]`, color.color);
      
      // Color images
      color.images.forEach((file, imageIndex) => {
        formData.append(`colors[${colorIndex}][images][${imageIndex}]`, file);
      });
      
      if (hasSizes) {
        // Color with sizes - send size quantities
        color.sizeQuantities.forEach((sq, sizeIndex) => {
          formData.append(
            `colors[${colorIndex}][sizes][${sizeIndex}][size]`,
            sq.size
          );
          formData.append(
            `colors[${colorIndex}][sizes][${sizeIndex}][quantity]`,
            String(sq.quantity)
          );
        });
      } else {
        // Color without sizes - send simple quantity
        formData.append(
          `colors[${colorIndex}][quantity]`,
          String(color.quantity || 0)
        );
      }
    });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Something went wrong');

      alert('Product updated successfully!');
      router.push('/sell/products');
    } catch (err: any) {
      console.error(err);
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addColor = () => {
    setColors((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        color: '#cccccc',
        images: [],
        existingImages: [],
        sizeQuantities: SIZES.map((size) => ({ size, quantity: 0 })),
        quantity: 0,
      },
    ]);
  };

  const updateSizeQuantity = (
    colorId: string,
    size: string,
    quantity: number
  ) => {
    setColors((prev) =>
      prev.map((color) =>
        color.id === colorId
          ? {
              ...color,
              sizeQuantities: color.sizeQuantities.map((sq) =>
                sq.size === size ? { ...sq, quantity } : sq
              ),
            }
          : color
      )
    );
  };

  const updateColorQuantity = (id: string, quantity: number) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, quantity } : c))
    );
  };

  const removeColor = (id: string) => {
    setColors((prev) => prev.filter((c) => c.id !== id));
  };

  const updateColor = (id: string, color: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, color } : c))
    );
  };

  const handleImageChange = (id: string, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, images: fileArray } : c))
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#f7f8fa]">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">Loading product...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="flex min-h-screen bg-[#f7f8fa]">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errors.fetch}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/sell/products')}
                className="flex items-center space-x-2 text-[#6a7581] hover:text-[#121416] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Products</span>
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#121416] mb-1">
                Edit Product
              </h1>
              <p className="text-[#6a7581]">Update your product information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-[#121416] mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#121416] focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-[#dde0e3]'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#121416] mb-2">
                  Price (LKR) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#121416] focus:border-transparent ${
                    errors.price ? 'border-red-300' : 'border-[#dde0e3]'
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#121416] mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#121416] focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-[#dde0e3]'
                  }`}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>


            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-[#121416] mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#121416] focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-[#dde0e3]'
                }`}
                placeholder="Describe your product..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Colors Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#121416]">Colors</h3>
                <button
                  type="button"
                  onClick={addColor}
                  className="px-4 py-2 bg-[#121416] text-white rounded-lg hover:bg-[#2a2d30] transition-colors"
                >
                  + Add Color
                </button>
              </div>

              {errors.colors && (
                <p className="text-red-500 text-sm mb-4">{errors.colors}</p>
              )}

              {colors.map((color, index) => (
                <div
                  key={color.id}
                  className="border border-[#dde0e3] rounded-lg p-6 mb-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-medium text-[#121416]">
                      Color {index + 1}
                    </h4>
                    {colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColor(color.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-[#121416] mb-2">
                        Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200"
                          style={{ backgroundColor: color.color }}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'color';
                            input.value = color.color;
                            input.onchange = (e) => updateColor(color.id, (e.target as HTMLInputElement).value);
                            input.click();
                          }}
                        />
                        <span className="text-sm text-[#6a7581]">
                          {color.color}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#121416] mb-2">
                        Images
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageChange(color.id, e.target.files)}
                        className="w-full px-4 py-3 border border-[#dde0e3] rounded-lg"
                      />
                      {color.existingImages.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          {color.existingImages.length} existing image(s)
                        </p>
                      )}
                    </div>
                  </div>

                  {hasSizes ? (
                    <div>
                      <label className="block text-sm font-medium text-[#121416] mb-2">
                        Size Quantities
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {color.sizeQuantities.map((sq) => (
                          <div key={sq.size}>
                            <label className="block text-xs text-[#6a7581] mb-1">
                              {sq.size}
                            </label>
                            <input
                              type="number"
                              value={sq.quantity}
                              onChange={(e) =>
                                updateSizeQuantity(
                                  color.id,
                                  sq.size,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-2 py-1 border border-[#dde0e3] rounded text-sm"
                              min="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-[#121416] mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={color.quantity || 0}
                        onChange={(e) =>
                          updateColorQuantity(
                            color.id,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-4 py-3 border border-[#dde0e3] rounded-lg"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {errors.quantities && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{errors.quantities}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#121416] text-white rounded-lg hover:bg-[#2a2d30] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Product'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/sell/products')}
                className="px-8 py-3 border border-[#dde0e3] text-[#6a7581] rounded-lg hover:bg-[#f7f8fa] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 