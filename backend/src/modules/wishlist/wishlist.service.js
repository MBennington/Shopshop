const WishlistModel = require('./wishlist.model');
const userService = require('../users/user.service');
const productService = require('../products/product.service');
const repository = require('../../services/repository.service');

/**
 * Add product to wishlist
 * @param {Object} body - { product_id }
 * @param {String} user_id
 * @returns {Promise<Object>}
 */
module.exports.addToWishlist = async (body, user_id) => {
  const user = await userService.getUserById(user_id);
  if (!user) {
    throw new Error('User not found.');
  }

  const { product_id } = body;

  const product = await productService.getProductById(product_id);
  if (!product) {
    throw new Error('Product not found!');
  }

  // Check if product is active
  if (!product.isActive) {
    throw new Error('Product is not available.');
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
          added_at: new Date(),
        },
      ],
    });

    await repository.save(newWishlist);
    return newWishlist.toObject();
  }

  // Check if product already exists in wishlist
  const existingItem = wishlist.items.find(
    (item) => item.product_id.toString() === product_id
  );

  if (existingItem) {
    throw new Error('Product is already in your wishlist.');
  }

  // Add product to existing wishlist
  wishlist.items.push({
    product_id,
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

