const ProductModel = require('./product.model');
const userService = require('../users/user.service');
const { roles } = require('../../config/role.config');
const repository = require('../../services/repository.service');

/**
 * Create new product
 * @param body
 * @returns {Promise<*>}
 */
module.exports.createProduct = async (body, user_id) => {
  const user = await userService.getUserById(user_id);

  if (!user) {
    throw new Error('User not found.');
  }
  if (user.role !== roles.seller) {
    throw new Error(
      'Only sellers are allowed to add products. Please log in with a seller account.'
    );
  }

  // Create new product
  let product = new ProductModel({
    ...body,
    seller: user._id,
  });
  await repository.save(product);

  product = product.toObject();

  return product;
};
