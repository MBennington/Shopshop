'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

interface SizeQuantity {
  size: string;
  quantity: number;
}

interface ColorOption {
  id: string;
  color: string;
  images: File[];
  imagePreviews: string[]; // Store preview URLs
  sizeQuantities: SizeQuantity[];
  quantity?: number; // if no size tracking for this color
}

export default function AddProductPage() {
  const router = useRouter();
  const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
  
  // Initialize with one default color
  const [colors, setColors] = useState<ColorOption[]>([
    {
      id: Math.random().toString(36).slice(2),
      color: '#cccccc',
      images: [],
      imagePreviews: [],
      sizeQuantities: SIZES.map((size) => ({ size, quantity: 0 })),
      quantity: 0,
    },
  ]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [hasSizes, setHasSizes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const previewUrlsRef = useRef<Set<string>>(new Set());

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
    formData.append('totalSizes', String(hasSizes ? 5 : 0)); // All sizes available when hasSizes is true

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
      const res = await fetch(`http://localhost:5000/api/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Something went wrong');

      // Clean up preview URLs before reset
      colors.forEach((color) => {
        color.imagePreviews.forEach((url) => {
          URL.revokeObjectURL(url);
          previewUrlsRef.current.delete(url);
        });
      });

      // Reset form on success
      setName('');
      setPrice('');
      setDescription('');
      setCategory('');
      setColors([
        {
          id: Math.random().toString(36).slice(2),
          color: '#cccccc',
          images: [],
          imagePreviews: [],
          sizeQuantities: SIZES.map((size) => ({ size, quantity: 0 })),
          quantity: 0,
        },
      ]);

      alert('Product created successfully!');
      // Redirect to products page after showing success message
      router.push('/sell/products');
    } catch (err: any) {
      console.error(err);
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const addColor = () => {
    setColors((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        color: '#cccccc',
        images: [],
        imagePreviews: [],
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
    setColors((prev) => {
      const colorToRemove = prev.find((c) => c.id === id);
      // Clean up preview URLs
      if (colorToRemove) {
        colorToRemove.imagePreviews.forEach((url) => {
          URL.revokeObjectURL(url);
          previewUrlsRef.current.delete(url);
        });
      }
      return prev.filter((c) => c.id !== id);
    });
  };

  const updateColor = (id: string, color: string) => {
    setColors((prev) => prev.map((c) => (c.id === id ? { ...c, color } : c)));
  };

  const handleImageChange = (id: string, files: FileList | null) => {
    if (!files) return;

    setColors((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          // Get current number of images
          const currentImageCount = c.images.length;
          const remainingSlots = 5 - currentImageCount;

          if (remainingSlots <= 0) {
            alert('Maximum 5 images allowed per color. Please remove an image first.');
            return c;
          }

          // Validate file sizes (max 5MB per file)
          const maxSize = 5 * 1024 * 1024; // 5MB
          const validFiles = Array.from(files).filter((file) => {
            if (file.size > maxSize) {
              alert(`File ${file.name} is too large. Maximum size is 5MB.`);
              return false;
            }
            return true;
          });

          // Limit new files to remaining slots
          const newFiles = validFiles.slice(0, remainingSlots);
          
          if (validFiles.length > remainingSlots) {
            alert(`Only ${remainingSlots} more image(s) can be added. Maximum 5 images allowed per color.`);
          }

          // Create preview URLs for new files only
          const newPreviews = newFiles.map((file) => {
            const url = URL.createObjectURL(file);
            previewUrlsRef.current.add(url);
            return url;
          });
          
          return {
            ...c,
            images: [...c.images, ...newFiles],
            imagePreviews: [...c.imagePreviews, ...newPreviews],
          };
        }
        return c;
      })
    );
  };

  const removeImage = (colorId: string, imageIndex: number) => {
    setColors((prev) =>
      prev.map((c) => {
        if (c.id === colorId) {
          // Clean up the preview URL
          const urlToRemove = c.imagePreviews[imageIndex];
          URL.revokeObjectURL(urlToRemove);
          previewUrlsRef.current.delete(urlToRemove);
          
          return {
            ...c,
            images: c.images.filter((_, idx) => idx !== imageIndex),
            imagePreviews: c.imagePreviews.filter((_, idx) => idx !== imageIndex),
          };
        }
        return c;
      })
    );
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    };
  }, []);

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
                Add New Product
              </h1>
              <p className="text-[#6a7581]">Create a new product listing</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#121417] text-sm font-medium mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-[#dde0e3]'
                    }`}
                    placeholder="Enter product name"
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#121417] text-sm font-medium mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-[#dde0e3]'
                    }`}
                    placeholder="Enter price in LKR"
                    min="0"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[#121417] text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-[#dde0e3]'
                  }`}
                  rows={4}
                  placeholder="Enter product description"
                  maxLength={500}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#121417] text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#121416] focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-[#dde0e3]'
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

              <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-6 flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasSizes}
                        onChange={() => setHasSizes(!hasSizes)}
                      />
                      <span className="text-sm text-[#121416]">Has Sizes</span>
                    </label>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#121417] mb-2">
                      Color Options
                    </label>
                    {errors.colors && (
                      <p className="text-red-500 text-sm mb-2">
                        {errors.colors}
                      </p>
                    )}
                    <div className="flex flex-col gap-4">
                      {colors.map((colorOption, idx) => (
                        <div
                          key={colorOption.id}
                          className="border border-[#dde0e3] rounded p-4 space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={colorOption.color}
                              onChange={(e) =>
                                updateColor(colorOption.id, e.target.value)
                              }
                              className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
                            />
                            <span>{colorOption.color}</span>
                            <button
                              type="button"
                              onClick={() => removeColor(colorOption.id)}
                              className="ml-auto text-red-500 text-sm"
                            >
                              Remove
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#121417] mb-1">
                              Upload Images (Max 5, 5MB each)
                            </label>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) =>
                                handleImageChange(
                                  colorOption.id,
                                  e.target.files
                                )
                              }
                              className="block w-full text-sm text-[#121417] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#121416] file:text-white hover:file:bg-[#2a2d30] file:cursor-pointer"
                            />
                            
                            {/* Image Previews */}
                            {colorOption.imagePreviews.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-[#6a7581] mb-2">
                                  {colorOption.imagePreviews.length} image(s) selected
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                  {colorOption.imagePreviews.map((preview, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      className="relative group aspect-square rounded-lg overflow-hidden border border-[#dde0e3] bg-[#f7f8fa]"
                                    >
                                      <img
                                        src={preview}
                                        alt={`Preview ${imgIdx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeImage(colorOption.id, imgIdx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        title="Remove image"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {hasSizes ? (
                            <div>
                              <label className="block text-xs font-medium text-[#121417] mb-1">
                                Size Quantities
                              </label>
                              <div className="grid grid-cols-3 gap-4">
                                {colorOption.sizeQuantities.map((sq) => (
                                  <div
                                    key={sq.size}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="text-sm w-6">
                                      {sq.size}
                                    </span>
                                    <input
                                      type="number"
                                      min={0}
                                      value={sq.quantity || ''}
                                      onChange={(e) =>
                                        updateSizeQuantity(
                                          colorOption.id,
                                          sq.size,
                                          Number(e.target.value) || 0
                                        )
                                      }
                                      className="w-20 px-2 py-1 border border-[#dde0e3] rounded"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-xs font-medium text-[#121417] mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={colorOption.quantity || ''}
                                onChange={(e) =>
                                  updateColorQuantity(
                                    colorOption.id,
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="w-32 px-3 py-2 border border-[#dde0e3] rounded"
                              />
                            </div>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addColor}
                        className="w-fit px-4 py-2 bg-[#121416] text-white rounded-lg hover:bg-[#2a2d30] transition-colors text-sm font-medium"
                      >
                        + Add Color
                      </button>
                      {errors.quantities && (
                        <p className="text-red-500 text-sm mt-2">
                          {errors.quantities}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    // Clean up preview URLs before reset
                    colors.forEach((color) => {
                      color.imagePreviews.forEach((url) => {
                        URL.revokeObjectURL(url);
                        previewUrlsRef.current.delete(url);
                      });
                    });
                    
                    // Reset form
                    setName('');
                    setPrice('');
                    setDescription('');
                    setCategory('');
                    setColors([
                      {
                        id: Math.random().toString(36).slice(2),
                        color: '#cccccc',
                        images: [],
                        imagePreviews: [],
                        sizeQuantities: SIZES.map((size) => ({ size, quantity: 0 })),
                        quantity: 0,
                      },
                    ]);
                    setErrors({});
                  }}
                  className="px-6 py-2 border border-[#dde0e3] rounded-lg text-[#6a7581] hover:bg-[#f7f8fa]"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#121416] text-white hover:bg-[#2a2d30]'
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
