const ProductModel = require('./product.model');
const userService = require('../users/user.service');
const reviewService = require('../reviews/review.service');
const { roles } = require('../../config/role.config');
const repository = require('../../services/repository.service');
const {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require('../../services/cloudinary.service');
const stockService = require('../stock/stock.service');
const mongoose = require('mongoose');
const extractPublicIdFromUrl = require('../../utils/extractPublicIdFromUrl.util');

/**
 * Build a regex pattern that matches text ignoring case and treating spaces/hyphens as equivalent.
 * E.g. "t shirt" matches "T-Shirt", "T SHIRT", "tshirt", etc.
 * @param {string} search - Raw search string
 * @returns {string} MongoDB $regex pattern
 */
function buildFlexibleSearchPattern(search) {
  if (!search || typeof search !== 'string') return '';
  const normalized = search
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, '');
  if (!normalized) return '';
  const escapeRegex = (c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = normalized.split('').map(escapeRegex).join('[\\s\\-]*');
  return pattern;
}

/**
 * Process product data with image uploads
 * @param body
 * @param files
 * @param existingProduct - Optional, for updates
 * @returns {Promise<*>}
 */
module.exports.processProductData = async (
  body,
  files,
  existingProduct = null,
) => {
  const processedData = {
    name: body.name,
    category: body.category,
    price: Number(body.price),
    description: body.description,
    hasSizes: body.hasSizes === 'true' || body.hasSizes === true,
    colors: [],
  };

  if (body.colors && Array.isArray(body.colors)) {
    // Process each color with its images
    for (let colorIndex = 0; colorIndex < body.colors.length; colorIndex++) {
      const colorData = body.colors[colorIndex];
      const color = {
        colorCode: colorData.colorCode,
        colorName: colorData.colorName,
        images: [],
        sizes: [],
        quantity: 0,
      };

      // Get existing images for this color (for updates)
      const existingImages =
        existingProduct?.colors?.[colorIndex]?.images || [];
      console.log(
        `Color ${colorIndex} - Existing images:`,
        existingImages.length,
      );

      // Check if keepImages is provided (images to keep from existing)
      const keepImages = colorData.keepImages || [];
      const imagesToKeep = Array.isArray(keepImages) ? keepImages : [];

      // Find images for this color from the files array
      const colorImages = files
        ? files.filter(
            (file) =>
              file.fieldname === `colors[${colorIndex}][images]` ||
              file.fieldname.startsWith(`colors[${colorIndex}][images][`),
          )
        : [];

      console.log(
        `Color ${colorIndex} - Found ${colorImages.length} new images, keeping ${imagesToKeep.length} existing images`,
      );

      // Upload new images if any
      const uploadedImages = [];
      if (colorImages.length > 0) {
        for (const file of colorImages) {
          try {
            const uploadResult = await uploadBufferToCloudinary(
              file.buffer,
              file.originalname,
              'products',
            );
            uploadedImages.push(uploadResult.url);
            console.log(`Uploaded image: ${uploadResult.url}`);
          } catch (error) {
            console.error(
              `Failed to upload image for color ${colorIndex}:`,
              error,
            );
            throw new Error(`Failed to upload image: ${error.message}`);
          }
        }
      }

      // Determine which existing images to delete
      const imagesToDelete = existingImages.filter(
        (img) => !imagesToKeep.includes(img),
      );

      // Delete removed images from Cloudinary
      if (existingProduct && imagesToDelete.length > 0) {
        console.log(
          `Deleting ${imagesToDelete.length} removed images for color ${colorIndex}`,
        );
        for (const oldImageUrl of imagesToDelete) {
          try {
            const publicId = extractPublicIdFromUrl(oldImageUrl);
            if (publicId) {
              await deleteFromCloudinary(publicId);
              console.log(`Deleted removed image: ${publicId}`);
            }
          } catch (error) {
            console.error(`Failed to delete old image: ${oldImageUrl}`, error);
            // Don't throw error for deletion failures
          }
        }
      }

      // Combine kept existing images with new uploaded images
      color.images = [...imagesToKeep, ...uploadedImages];
      console.log(
        `Color ${colorIndex} - Final images: ${imagesToKeep.length} kept + ${uploadedImages.length} new = ${color.images.length} total`,
      );

      if (processedData.hasSizes) {
        if (colorData.sizes && Array.isArray(colorData.sizes)) {
          color.sizes = colorData.sizes.map((sizeData) => ({
            size: sizeData.size,
            quantity: Number(sizeData.quantity),
          }));
        }
      } else {
        color.quantity = Number(colorData.quantity || 0);
      }

      processedData.colors.push(color);
    }
  }

  console.log(
    'Final processed data colors:',
    processedData.colors.map((c) => ({
      name: c.colorName,
      imageCount: c.images.length,
    })),
  );
  return processedData;
};

/**
 * Create new product
 * @param body
 * @returns {Promise<*>}
 */
module.exports.createProduct = async (body, files, user_id) => {
  const user = await userService.getUserById(user_id);

  if (!user) {
    throw new Error('User not found.');
  }
  if (user.role !== roles.seller) {
    throw new Error(
      'Only sellers are allowed to add products. Please log in with a seller account.',
    );
  }

  const processedData = await this.processProductData(body, files);

  // Create new product
  let product = new ProductModel({
    ...processedData,
    seller: user._id,
  });
  await repository.save(product);

  product = product.toObject();

  return product;
};

/**
 * Get products with inventory information
 * @param filter
 * @returns {Promise<*>}
 */
module.exports.getProductsWithInventory = async (filter = {}) => {
  const products = await repository.find(ProductModel, filter);

  const result = [];
  for (const product of products) {
    const productObj = product.toObject();
    productObj.totalInventory = await stockService.getTotalAvailableStock(
      product._id,
    );
    result.push(productObj);
  }
  return result;
};

/**
 * Get all products by seller (includes inactive products for seller management)
 * @param sellerId
 * @returns {Promise<*>}
 */
module.exports.getProductsBySeller = async (seller_id) => {
  const products = await repository.findMany(ProductModel, {
    seller: seller_id,
  });
  console.log('products ', products);

  const result = [];
  for (const product of products) {
    const productObj = product.toObject();
    productObj.totalInventory = await stockService.getTotalAvailableStock(
      product._id,
    );
    result.push(productObj);
  }
  return result;
};

/**
 * Get active products by seller (for public shop pages)
 * @param sellerId
 * @returns {Promise<*>}
 */
module.exports.getActiveProductsBySeller = async (seller_id) => {
  const products = await repository.findMany(ProductModel, {
    seller: seller_id,
    isActive: { $ne: false }, // Only active products
  });
  console.log('active products ', products);

  const result = [];
  for (const product of products) {
    const productObj = product.toObject();
    productObj.totalInventory = await stockService.getTotalAvailableStock(
      product._id,
    );
    result.push(productObj);
  }
  return result;
};

/**
 * Update product
 * @param body - This should be the processed data with images
 * @param product_id
 * @param user_id
 * @returns {Promise<*>}
 */
module.exports.updateProduct = async (body, product_id, user_id) => {
  const user = await userService.getUserById(user_id);

  if (!user) {
    throw new Error('User not found.');
  }
  if (user.role !== roles.seller) {
    throw new Error(
      'Only sellers are allowed to update products. Please log in with a seller account.',
    );
  }

  let existingProduct = await this.getProductById(product_id);

  if (!existingProduct) {
    throw new Error('Product not found');
  }

  // Check if the product belongs to the user
  if (existingProduct.seller.toString() !== user._id.toString()) {
    throw new Error('You can only update your own products');
  }

  // Use the processed data directly (it already has images uploaded)
  const processedData = {
    name: body.name,
    category: body.category,
    price: body.price,
    description: body.description,
    hasSizes: body.hasSizes,
    colors: body.colors,
  };

  const updatedProduct = await repository.updateOne(
    ProductModel,
    {
      _id: new mongoose.Types.ObjectId(product_id),
    },
    processedData,
    {
      new: true,
    },
  );

  return updatedProduct;
};

/**
 * Get product by id
 * @param id
 * @returns {Promise<*>}
 */
module.exports.getProductById = async (product_id) => {
  return repository.findOne(ProductModel, {
    _id: new mongoose.Types.ObjectId(product_id),
  });
};

/**
 * Toggle product active status (activate/deactivate)
 * @param product_id
 * @param user_id
 * @returns {Promise<*>}
 */
module.exports.toggleProductStatus = async (product_id, user_id) => {
  const user = await userService.getUserById(user_id);

  if (!user) {
    throw new Error('User not found.');
  }
  if (user.role !== roles.seller) {
    throw new Error(
      'Only sellers are allowed to deactivate products. Please log in with a seller account.',
    );
  }

  const existingProduct = await this.getProductById(product_id);
  if (!existingProduct) {
    throw new Error('Product not found');
  }

  // Check if the product belongs to the user
  if (existingProduct.seller.toString() !== user._id.toString()) {
    throw new Error('You can only deactivate your own products');
  }

  // Toggle product isActive status
  const updatedProduct = await repository.updateOne(
    ProductModel,
    {
      _id: new mongoose.Types.ObjectId(product_id),
    },
    { isActive: !existingProduct.isActive },
    {
      new: true,
    },
  );

  return updatedProduct.isActive
    ? 'Product activated successfully'
    : 'Product deactivated successfully';
};

/**
 * Unified product fetching with filtering, pagination, and sorting
 * Supports: category filtering, shop filtering, seller management, and more
 * @param body - Query parameters
 * @returns {Promise<*>}
 */
module.exports.getProducts = async (body) => {
  const {
    // Pagination
    limit = 10,
    page = 1,

    // Search
    search,

    // === MATCH QUERY FILTERS ===

    // 1. Status Filters
    isActive, // 'true', 'false', or undefined (both)
    includeInactive, // boolean - include inactive products

    // 2. Seller/Shop Filter (single)
    seller, // seller ID (for shop pages)

    // 3. Category Filter (single)
    category, // single category

    // 4. Product Type Filters
    filterType, // 'all', 'new_arrivals', 'best_sellers', 'sale', 'out_of_stock', 'in_stock'

    // 5. Price Range Filters
    priceMin, // minimum price
    priceMax, // maximum price

    // 6. Inventory Filters
    minStock, // minimum inventory quantity
    maxStock, // maximum inventory quantity
    stockStatus, // 'in_stock', 'out_of_stock', 'low_stock', 'all'

    // 7. Date Range Filters
    createdAfter, // ISO date string
    createdBefore, // ISO date string
    updatedAfter, // ISO date string
    updatedBefore, // ISO date string

    // 8. Sale/Discount Filters
    onSale, // boolean - products on sale
    discountMin, // minimum discount percentage
    discountMax, // maximum discount percentage

    // === SORTING PARAMETERS ===
    order, // 'asc' or 'desc'
    column, // 0=name, 1=price, 2=category, -1=created_at
    sortBy, // 'featured', 'price_asc', 'price_desc', 'newest', 'oldest', 'name_asc', 'name_desc', 'best_sellers'
  } = body;

  console.log('query ', body);

  // Build match query
  let matchQuery = {};

  // 1. STATUS FILTERS
  // Inactive products only visible on seller/products and admin/products; all other listings show active only.
  const includeInactiveOnly = includeInactive === true || includeInactive === 'true';
  if (includeInactiveOnly) {
    // Seller dashboard / admin: show all (no filter)
  } else if (isActive === 'false') {
    // Explicit request for inactive only
    matchQuery.isActive = false;
  } else {
    // Default for public listings (home, category, deals, search, shop): active only
    matchQuery.isActive = { $ne: false };
  }

  // 2. SELLER/SHOP FILTER (single)
  if (seller) {
    matchQuery.seller = new mongoose.Types.ObjectId(seller);
  }

  // 3. CATEGORY FILTER (single)
  if (category) {
    matchQuery.category = category;
  }

  // 4. PRODUCT TYPE FILTERS (filterType)
  if (filterType === 'new_arrivals') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    matchQuery.created_at = { $gte: thirtyDaysAgo };
  } else if (filterType === 'best_sellers') {
    // Filter by salesCount (actual sales data)
    matchQuery.salesCount = { $gt: 0 }; // Products with at least 1 sale
  } else if (filterType === 'sale') {
    matchQuery.onSale = true; // Requires onSale field in product model
  }
  // out_of_stock and in_stock are handled after inventory calculation

  // 5. PRICE RANGE FILTERS
  if (priceMin !== undefined || priceMax !== undefined) {
    matchQuery.price = {};
    if (priceMin !== undefined) {
      matchQuery.price.$gte = parseFloat(priceMin);
    }
    if (priceMax !== undefined) {
      matchQuery.price.$lte = parseFloat(priceMax);
    }
  }

  // 7. DATE RANGE FILTERS
  if (createdAfter || createdBefore) {
    matchQuery.created_at = matchQuery.created_at || {};
    if (createdAfter) {
      matchQuery.created_at.$gte = new Date(createdAfter);
    }
    if (createdBefore) {
      matchQuery.created_at.$lte = new Date(createdBefore);
    }
  }
  if (updatedAfter || updatedBefore) {
    matchQuery.updated_at = {};
    if (updatedAfter) {
      matchQuery.updated_at.$gte = new Date(updatedAfter);
    }
    if (updatedBefore) {
      matchQuery.updated_at.$lte = new Date(updatedBefore);
    }
  }

  // 8. SALE/DISCOUNT FILTERS
  if (onSale === true || onSale === 'true') {
    matchQuery.onSale = true; // Requires onSale field
  }
  if (discountMin !== undefined || discountMax !== undefined) {
    matchQuery.discountPercentage = {};
    if (discountMin !== undefined) {
      matchQuery.discountPercentage.$gte = parseFloat(discountMin);
    }
    if (discountMax !== undefined) {
      matchQuery.discountPercentage.$lte = parseFloat(discountMax);
    }
  }

  console.log('match query: ', matchQuery);

  // === SORTING LOGIC ===
  let sortQuery = {};

  // Handle sortBy parameter (more user-friendly)
  if (sortBy) {
    switch (sortBy) {
      case 'featured':
        sortQuery = { created_at: -1 };
        break;
      case 'price_asc':
        sortQuery = { price: 1, created_at: -1 };
        break;
      case 'price_desc':
        sortQuery = { price: -1, created_at: -1 };
        break;
      case 'newest':
        sortQuery = { created_at: -1 };
        break;
      case 'oldest':
        sortQuery = { created_at: 1 };
        break;
      case 'name_asc':
        sortQuery = { name: 1, created_at: -1 };
        break;
      case 'name_desc':
        sortQuery = { name: -1, created_at: -1 };
        break;
      case 'best_sellers':
        // Sort by salesCount (actual sales data)
        sortQuery = { salesCount: -1, created_at: -1 };
        break;
      default:
        sortQuery = { created_at: -1 };
    }
  } else {
    // Fallback to column/order parameters
    const sortingOrder = order === 'asc' ? 1 : -1;
    const columnNum = parseInt(column) || -1;
    const sortingColumn =
      columnNum === 0
        ? 'name'
        : columnNum === 1
          ? 'price'
          : columnNum === 2
            ? 'category'
            : 'created_at';

    sortQuery = {
      [sortingColumn]: sortingOrder,
      created_at: -1, // Secondary sort
    };
  }

  // Build aggregation pipeline
  const pageLimit = Math.max(1, Math.min(parseInt(limit) || 10, 100));
  const pageNumber = Math.max(1, parseInt(page) || 1);

  // Build pipeline stages - totalInventory from stock collection (single source of truth)
  const pipeline = [
    // Initial match query
    { $match: matchQuery },

    // Lookup stock record for this product
    {
      $lookup: {
        from: 'stocks',
        localField: '_id',
        foreignField: 'product_id',
        as: '_stockDoc',
      },
    },

    // Compute totalInventory from stock.available_stock_by_color (not from product.colors)
    {
      $addFields: {
        totalInventory: {
          $let: {
            vars: {
              s: { $arrayElemAt: ['$_stockDoc', 0] },
            },
            in: {
              $cond: {
                if: { $not: '$$s' },
                then: 0,
                else: {
                  $reduce: {
                    input: { $ifNull: ['$$s.available_stock_by_color', []] },
                    initialValue: 0,
                    in: {
                      $add: [
                        '$$value',
                        {
                          $cond: {
                            if: {
                              $gt: [
                                { $size: { $ifNull: ['$$this.sizes', []] } },
                                0,
                              ],
                            },
                            then: {
                              $sum: {
                                $map: {
                                  input: '$$this.sizes',
                                  as: 'sz',
                                  in: { $ifNull: ['$$sz.availableStock', 0] },
                                },
                              },
                            },
                            else: { $ifNull: ['$$this.availableStock', 0] },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // Drop the temporary lookup field so it's not in the response
    { $project: { _stockDoc: 0 } },
  ];

  // Apply inventory-based filters after calculation
  const inventoryFilters = [];

  if (filterType === 'out_of_stock') {
    inventoryFilters.push({ $match: { totalInventory: 0 } });
  } else if (filterType === 'in_stock') {
    inventoryFilters.push({ $match: { totalInventory: { $gt: 0 } } });
  }
  // best_sellers filter is now handled in matchQuery using salesCount

  if (stockStatus === 'out_of_stock') {
    inventoryFilters.push({ $match: { totalInventory: 0 } });
  } else if (stockStatus === 'in_stock') {
    inventoryFilters.push({ $match: { totalInventory: { $gt: 0 } } });
  } else if (stockStatus === 'low_stock') {
    inventoryFilters.push({ $match: { totalInventory: { $gt: 0, $lte: 10 } } });
  }

  if (minStock !== undefined) {
    inventoryFilters.push({
      $match: { totalInventory: { $gte: parseFloat(minStock) } },
    });
  }
  if (maxStock !== undefined) {
    inventoryFilters.push({
      $match: { totalInventory: { $lte: parseFloat(maxStock) } },
    });
  }

  pipeline.push(...inventoryFilters);

  // Search handling: case-insensitive, spaces and hyphens treated as equivalent
  if (search) {
    const pattern = buildFlexibleSearchPattern(search);
    if (pattern) {
      const searchRegex = { $regex: pattern, $options: 'i' };
      pipeline.push({
        $match: {
          $or: [
            { name: searchRegex },
            { category: searchRegex },
            { description: searchRegex },
          ],
        },
      });
    }
  }

  // Count and paginate using $facet
  pipeline.push({
    $facet: {
      records: [
        { $sort: sortQuery },
        { $skip: (pageNumber - 1) * pageLimit },
        { $limit: pageLimit },
      ],
      recordsTotal: [{ $count: 'count' }],
    },
  });

  const result = await repository.findByAggregateQuery(ProductModel, pipeline);
  console.log('result ', result);

  const records = result?.[0]?.records || [];
  const recordsTotal = result?.[0]?.recordsTotal?.[0]?.count || 0;

  // totalInventory is from stock collection in pipeline; ensure number for each record
  const recordsWithInventory = records.map((product) => {
    const productObj = product.toObject ? product.toObject() : product;
    if (
      productObj.totalInventory === undefined ||
      productObj.totalInventory === null
    ) {
      productObj.totalInventory = 0;
    }
    return productObj;
  });

  return {
    records: recordsWithInventory,
    recordsTotal,
    recordsFiltered: records.length,
  };
};

/**
 * Get product details with seller info and review summary
 * @param productId
 * @returns {Promise<*>}
 */
module.exports.getProductDetails = async (productId) => {
  // Get product with inventory calculation
  const product = await repository.findOne(ProductModel, {
    _id: new mongoose.Types.ObjectId(productId),
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const productObj = product.toObject();
  productObj.totalInventory =
    await stockService.getTotalAvailableStock(productId);

  // Calculate available stock for each color/size variant
  if (productObj.colors && productObj.colors.length > 0) {
    for (
      let colorIndex = 0;
      colorIndex < productObj.colors.length;
      colorIndex++
    ) {
      const color = productObj.colors[colorIndex];

      if (productObj.hasSizes && color.sizes) {
        // Product with sizes - get available stock for each size
        for (let sizeIndex = 0; sizeIndex < color.sizes.length; sizeIndex++) {
          const size = color.sizes[sizeIndex];
          const availableStock = await stockService.getAvailableStock(
            product._id,
            color.colorCode,
            size.size,
          );
          productObj.colors[colorIndex].sizes[sizeIndex].availableQuantity =
            availableStock;
        }
      } else {
        // Product without sizes - get available stock for color
        const availableStock = await stockService.getAvailableStock(
          product._id,
          color.colorCode,
          null,
        );
        productObj.colors[colorIndex].availableQuantity = availableStock;
      }
    }
  }

  // Get seller information
  const seller = await userService.getUserById(productObj.seller);

  // Get review summary
  const reviewSummary = await reviewService.getReviewSummary(productId, 5);

  return {
    product: productObj,
    seller: {
      _id: seller._id,
      name: seller.name,
      email: seller.email,
      avatar: seller.avatar,
      profilePicture: seller.profilePicture || seller.avatar,
      role: seller.role,
      businessName: seller.sellerInfo.businessName,
      baseShippingFee: seller.sellerInfo.baseShippingFee,
    },
    reviews: reviewSummary,
  };
};
