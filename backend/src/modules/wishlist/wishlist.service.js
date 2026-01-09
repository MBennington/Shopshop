const WishlistModel = require('./wishlist.model');
const userService = require('../users/user.service');
const productService = require('../products/product.service');
const stockService = require('../stock/stock.service');
const cartService = require('../cart/cart.service');
const repository = require('../../services/repository.service');
const mongoose = require('mongoose');

/**
 * Add product to wishlist
 * @param {Object} body - { product_id, color_id }
 * @param {String} user_id
 * @returns {Promise<Object>}
 */
module.exports.addToWishlist = async (body, user_id) => {
  const user = await userService.getUserById(user_id);
  if (!user) {
    throw new Error('User not found.');
  }

  const { product_id, color_id } = body;

  const product = await productService.getProductById(product_id);
  if (!product) {
    throw new Error('Product not found!');
  }

  // Check if product is active
  if (!product.isActive) {
    throw new Error('Product is not available.');
  }

  // Validate color_id exists in product (check by _id)
  // Convert color_id to ObjectId for comparison
  const colorObjectId = new mongoose.Types.ObjectId(color_id);
  const colorExists = product.colors.some(
    (color) => color._id && color._id.toString() === colorObjectId.toString()
  );
  if (!colorExists) {
    throw new Error('Color not found in product.');
  }

  // Find existing wishlist
  const wishlist = await repository.findOne(WishlistModel, { user_id });

  if (!wishlist) {
    // Create new wishlist with the product
    const newWishlist = new WishlistModel({
      user_id,
      items: [
        {
          product_id,
          color_id: colorObjectId,
          added_at: new Date(),
        },
      ],
    });

    await repository.save(newWishlist);
    return newWishlist.toObject();
  }

  // Check if product with same color already exists in wishlist (prevent duplicates)
  const existingItem = wishlist.items.find(
    (item) =>
      item.product_id.toString() === product_id &&
      item.color_id.toString() === colorObjectId.toString()
  );

  if (existingItem) {
    throw new Error('This product color is already in your wishlist.');
  }

  // Add product to existing wishlist
  wishlist.items.push({
    product_id,
    color_id: colorObjectId,
    added_at: new Date(),
  });

  const updatedWishlist = await repository.updateOne(
    WishlistModel,
    { _id: wishlist._id },
    { items: wishlist.items },
    { new: true }
  );

  return updatedWishlist.toObject();
};

/**
 * Get wishlist by user_id with products grouped by shops
 * @param {String} userId
 * @returns {Promise<Object>}
 */
module.exports.getWishlistByUserId = async (userId) => {
  const wishlist = await WishlistModel.aggregate([
    {
      $match: { user_id: new mongoose.Types.ObjectId(userId) },
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    // Filter out deleted products
    { $match: { product: { $ne: null } } },
    {
      $lookup: {
        from: 'users',
        localField: 'product.seller',
        foreignField: '_id',
        as: 'seller',
      },
    },
    { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
    // Filter out deleted sellers
    { $match: { seller: { $ne: null } } },
    {
      $project: {
        user_id: 1,
        product_id: '$items.product_id',
        color_id: '$items.color_id',
        added_at: '$items.added_at',
        productName: '$product.name',
        productPrice: '$product.price',
        productCategory: '$product.category',
        productDescription: '$product.description',
        productHasSizes: '$product.hasSizes',
        productColors: '$product.colors',
        productIsActive: '$product.isActive',
        seller_id: '$product.seller',
        sellerName: '$seller.name',
        businessName: {
          $ifNull: ['$seller.sellerInfo.businessName', '$seller.name'],
        },
        sellerProfilePicture: '$seller.profilePicture',
        created_at: 1,
        updated_at: 1,
      },
    },
  ]);

  if (!wishlist || wishlist.length === 0) {
    return {
      _id: null,
      user_id: userId,
      shops: {},
      created_at: null,
      updated_at: null,
    };
  }

  // Group products by shop and calculate availability
  const shops = {};
  
  for (const item of wishlist) {
    const sellerId = item.seller_id.toString();
    
    if (!shops[sellerId]) {
      shops[sellerId] = {
        shop_info: {
          _id: sellerId,
          name: item.sellerName,
          businessName: item.businessName,
          profilePicture: item.sellerProfilePicture || null,
        },
        products: [],
      };
    }

    // Find the specific color from color_id (using _id)
    const selectedColor = item.productColors?.find(
      (color) => color._id && color._id.toString() === item.color_id.toString()
    );

    let productImage = null;
    let totalAvailableStock = 0;
    let isAvailable = false;
    let colorName = null;
    let colorCode = null;

    if (selectedColor) {
      colorName = selectedColor.colorName;
      colorCode = selectedColor.colorCode;

      // Get first image from the selected color
      if (selectedColor.images && selectedColor.images.length > 0) {
        productImage = selectedColor.images[0];
      }

      // Calculate available stock for the specific color only
      if (item.productHasSizes && selectedColor.sizes && selectedColor.sizes.length > 0) {
        // Product with sizes - check each size for this color
        for (const size of selectedColor.sizes) {
          try {
            const availableStock = await stockService.getAvailableStock(
              item.product_id,
              colorCode,
              size.size
            );
            totalAvailableStock += availableStock;
          } catch (error) {
            console.error(
              `Error getting stock for product ${item.product_id}, color ${colorCode}, size ${size.size}:`,
              error
            );
          }
        }
      } else {
        // Product without sizes - check stock for this color
        try {
          totalAvailableStock = await stockService.getAvailableStock(
            item.product_id,
            colorCode,
            null
          );
        } catch (error) {
          console.error(
            `Error getting stock for product ${item.product_id}, color ${colorCode}:`,
            error
          );
        }
      }
    }

    // Determine availability status
    isAvailable = totalAvailableStock > 0 && item.productIsActive;

    shops[sellerId].products.push({
      product_id: item.product_id,
      color_id: item.color_id,
      color_name: colorName,
      color_code: colorCode,
      product_name: item.productName,
      product_image: productImage,
      price: item.productPrice,
      category: item.productCategory,
      description: item.productDescription,
      hasSizes: item.productHasSizes,
      isActive: item.productIsActive,
      availability: isAvailable ? 'in stock' : 'out of stock',
      availableStock: totalAvailableStock,
      added_at: item.added_at,
    });
  }

  // Get the first item's timestamps for the wishlist
  const firstItem = wishlist[0];

  return {
    _id: null, // Will be set if we have a wishlist document
    user_id: userId,
    shops: shops,
    created_at: firstItem.created_at,
    updated_at: firstItem.updated_at,
  };
};

/**
 * Remove product from wishlist
 * @param {Object} body - { product_id, color_id }
 * @param {String} user_id
 * @returns {Promise<Object>}
 */
module.exports.removeFromWishlist = async (body, user_id) => {
  const user = await userService.getUserById(user_id);
  if (!user) {
    throw new Error('User not found.');
  }

  const { product_id, color_id } = body;

  // Find existing wishlist
  const wishlist = await repository.findOne(WishlistModel, { user_id });

  if (!wishlist) {
    throw new Error('Wishlist not found.');
  }

  // Convert color_id to ObjectId for comparison
  const colorObjectId = new mongoose.Types.ObjectId(color_id);

  // Find the item to remove
  const itemIndex = wishlist.items.findIndex(
    (item) =>
      item.product_id.toString() === product_id &&
      item.color_id.toString() === colorObjectId.toString()
  );

  if (itemIndex === -1) {
    throw new Error('Product color not found in wishlist.');
  }

  // Remove the item
  wishlist.items.splice(itemIndex, 1);

  // Update wishlist
  const updatedWishlist = await repository.updateOne(
    WishlistModel,
    { _id: wishlist._id },
    { items: wishlist.items },
    { new: true }
  );

  return updatedWishlist.toObject();
};

/**
 * Add wishlist item to cart
 * @param {Object} body - { product_id, color_id, qty?, size? }
 * @param {String} user_id
 * @returns {Promise<Object>}
 */
module.exports.addWishlistItemToCart = async (body, user_id) => {
  const user = await userService.getUserById(user_id);
  if (!user) {
    throw new Error('User not found.');
  }

  const { product_id, color_id, qty = 1, size = null } = body;

  // Find the wishlist item to verify it exists
  const wishlist = await repository.findOne(WishlistModel, { user_id });
  if (!wishlist) {
    throw new Error('Wishlist not found.');
  }

  // Convert color_id to ObjectId for comparison
  const colorObjectId = new mongoose.Types.ObjectId(color_id);

  // Verify the item exists in wishlist
  const wishlistItem = wishlist.items.find(
    (item) =>
      item.product_id.toString() === product_id &&
      item.color_id.toString() === colorObjectId.toString()
  );

  if (!wishlistItem) {
    throw new Error('Item not found in wishlist.');
  }

  // Get product to find colorCode from color_id
  const product = await productService.getProductById(product_id);
  if (!product) {
    throw new Error('Product not found!');
  }

  // Find the color by _id to get colorCode
  const colorData = product.colors.find(
    (color) => color._id && color._id.toString() === colorObjectId.toString()
  );

  if (!colorData) {
    throw new Error('Color not found in product.');
  }

  // Check if product has sizes and size is required
  if (product.hasSizes && !size) {
    throw new Error('Size is required for this product. Please select a size.');
  }

  // Prepare cart payload
  const cartPayload = {
    product_id,
    qty,
    color: colorData.colorCode, // Use colorCode for cart
  };

  if (size) {
    cartPayload.size = size;
  }

  // Add to cart using existing cart service
  const cartResult = await cartService.createOrUpdateCart(cartPayload, user_id);

  // Remove item from wishlist after successfully adding to cart
  const itemIndex = wishlist.items.findIndex(
    (item) =>
      item.product_id.toString() === product_id &&
      item.color_id.toString() === colorObjectId.toString()
  );

  if (itemIndex !== -1) {
    wishlist.items.splice(itemIndex, 1);
    await repository.updateOne(
      WishlistModel,
      { _id: wishlist._id },
      { items: wishlist.items },
      { new: true }
    );
  }

  return cartResult;
};
