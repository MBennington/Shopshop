const ProductModel = require('./product.model');
const userService = require('../users/user.service');
const reviewService = require('../reviews/review.service');
const { roles } = require('../../config/role.config');
const repository = require('../../services/repository.service');
const {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require('../../services/cloudinary.service');
const mongoose = require('mongoose');
const extractPublicIdFromUrl = require('../../utils/extractPublicIdFromUrl.util');

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
  existingProduct = null
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
        existingImages.length
      );

      // Find images for this color from the files array
      const colorImages = files
        ? files.filter(
            (file) =>
              file.fieldname === `colors[${colorIndex}][images]` ||
              file.fieldname.startsWith(`colors[${colorIndex}][images][`)
          )
        : [];

      console.log(
        `Color ${colorIndex} - Found ${colorImages.length} new images`
      );

      if (colorImages.length > 0) {
        // If new images are uploaded, replace existing images (don't duplicate)
        const uploadedImages = [];
        for (const file of colorImages) {
          try {
            const uploadResult = await uploadBufferToCloudinary(
              file.buffer,
              file.originalname,
              'products'
            );
            uploadedImages.push(uploadResult.url);
            console.log(`Uploaded image: ${uploadResult.url}`);
          } catch (error) {
            console.error(
              `Failed to upload image for color ${colorIndex}:`,
              error
            );
            throw new Error(`Failed to upload image: ${error.message}`);
          }
        }

        // Delete old images from Cloudinary if this is an update
        if (existingProduct && existingImages.length > 0) {
          console.log(
            `Deleting ${existingImages.length} old images for color ${colorIndex}`
          );
          for (const oldImageUrl of existingImages) {
            try {
              const publicId = extractPublicIdFromUrl(oldImageUrl);
              if (publicId) {
                await deleteFromCloudinary(publicId);
                console.log(`Deleted old image: ${publicId}`);
              }
            } catch (error) {
              console.error(
                `Failed to delete old image: ${oldImageUrl}`,
                error
              );
              // Don't throw error for deletion failures
            }
          }
        }

        // Replace existing images with new ones (don't merge)
        color.images = uploadedImages;
        console.log(
          `Color ${colorIndex} - Replaced with ${uploadedImages.length} new images`
        );
      } else {
        // No new images, keep existing ones
        color.images = existingImages;
        console.log(
          `Color ${colorIndex} - Keeping existing images:`,
          color.images.length
        );
      }

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
    }))
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
      'Only sellers are allowed to add products. Please log in with a seller account.'
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
 * Calculate total inventory for a product
 * @param product
 * @returns {number}
 */
module.exports.calculateTotalInventory = (product) => {
  if (!product.colors || product.colors.length === 0) {
    return 0;
  }

  return product.colors.reduce((total, color) => {
    if (product.hasSizes) {
      // Sum quantities from all sizes
      return (
        total +
        color.sizes.reduce((colorTotal, size) => colorTotal + size.quantity, 0)
      );
    } else {
      // Use simple quantity
      return total + (color.quantity || 0);
    }
  }, 0);
};

/**
 * Get products with inventory information
 * @param filter
 * @returns {Promise<*>}
 */
module.exports.getProductsWithInventory = async (filter = {}) => {
  const products = await repository.find(ProductModel, filter);

  return products.map((product) => {
    const productObj = product.toObject();
    productObj.totalInventory =
      module.exports.calculateTotalInventory(productObj);
    return productObj;
  });
};

/**
 * Get all products by seller
 * @param sellerId
 * @returns {Promise<*>}
 */
module.exports.getProductsBySeller = async (seller_id) => {
  const products = await repository.findMany(ProductModel, {
    seller: seller_id,
  });

  return products.map((product) => {
    const productObj = product.toObject();
    productObj.totalInventory =
      module.exports.calculateTotalInventory(productObj);
    return productObj;
  });
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
      'Only sellers are allowed to update products. Please log in with a seller account.'
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
    }
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
 * Soft delete a product (change status to inactive)
 * @param product_id
 * @param user_id
 * @returns {Promise<*>}
 */
module.exports.deleteProduct = async (product_id, user_id) => {
  const user = await userService.getUserById(user_id);

  if (!user) {
    throw new Error('User not found.');
  }
  if (user.role !== roles.seller) {
    throw new Error(
      'Only sellers are allowed to deactivate products. Please log in with a seller account.'
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
    }
  );

  return updatedProduct;
};

/**
 * Get all products
 * @param body
 * @returns {Promise<*>}
 */
module.exports.getProducts = async (body) => {
  const { limit, order = 'desc', page, search, category } = body;
  const column = body.column || -1;

  // Simple sorting logic without external dependencies
  const sortingOrder = order === 'desc' || !order ? -1 : 1;
  const sortingColumn =
    column === 0
      ? 'name'
      : column === 1
      ? 'price'
      : column === 2
      ? 'category'
      : 'created_at';

  let matchQuery = {
    isActive: { $ne: false }, // Only active products
  };

  if (category) {
    matchQuery = {
      ...matchQuery,
      category: category,
    };
  }

  const sortQuery = {
    [sortingColumn]: sortingOrder,
    created_at: -1,
  };

  // Base query (no pagination)
  const prePaginationQuery = [{ $match: matchQuery }];

  // Count total records
  let recordsTotal = await repository.findByAggregateQuery(ProductModel, [
    ...prePaginationQuery,
    { $count: 'count' },
  ]);

  recordsTotal = recordsTotal?.[0]?.count || 0;

  // Ensure limit is positive and reasonable
  const pageLimit = Math.max(1, Math.min(parseInt(limit) || 10, 100));

  // Pagination + sorting
  const paginationQuery = [
    { $sort: sortQuery },
    { $skip: page ? pageLimit * (page - 1) : 0 },
    { $limit: pageLimit },
  ];

  let records;

  // If no search term, fetch normally
  if (!search) {
    records = await repository.findByAggregateQuery(ProductModel, [
      ...prePaginationQuery,
      ...paginationQuery,
    ]);
  } else {
    // If search term exists
    const searchRegex = { $regex: search, $options: 'i' };
    const searchQuery = [
      ...prePaginationQuery,
      {
        $match: {
          $or: [
            { name: searchRegex },
            { category: searchRegex },
            { description: searchRegex },
            { price: parseFloat(search) || -1 },
          ],
        },
      },
    ];

    const data = await repository.findByAggregateQuery(ProductModel, [
      {
        $facet: {
          records: [...searchQuery, ...paginationQuery],
          recordsTotal: [...searchQuery, { $count: 'count' }],
        },
      },
    ]);

    records = data?.[0]?.records || [];
    recordsTotal = data?.[0]?.recordsTotal?.[0]?.count || 0;
  }

  const recordsFiltered = records?.length || 0;

  return {
    records,
    recordsTotal,
    recordsFiltered,
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
    module.exports.calculateTotalInventory(productObj);

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
      role: seller.role,
      businessName: seller.businessName,
    },
    reviews: reviewSummary,
  };
};
