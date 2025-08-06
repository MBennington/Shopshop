const CartModel = require('./cart.model');
const userModel = require('../users/user.model');
const userService = require('../users/user.service');
const mongoose = require('mongoose');
const repository = require('../../services/repository.service');
const productService = require('../products/product.service');

/**
 * Add or Update Cart
 * @param {Object} body
 * @param {String} user_id
 * @returns {Promise<Object>}
 */
module.exports.createOrUpdateCart = async (body, user_id) => {
  const user = await userService.getUserById(user_id);
  if (!user) {
    throw new Error('User not found.');
  }

  const newProduct = body; // { product_id, qty, size, color, price }

  const product = await productService.getProductById(newProduct.product_id);

  if (!product) {
    throw new Error('Product not found!');
  }

  const subTotal = newProduct.qty * product.price;

  const cart = await CartModel.findOne({ user_id });

  if (!cart) {
    const newCartItem = new CartModel({
      user_id,
      products_list: [
        {
          product_id: newProduct.product_id,
          quantity: newProduct.qty,
          color: newProduct.color,
          size: newProduct.size,
          subtotal: subTotal,
        },
      ],
      total: subTotal,
    });

    await repository.save(newCartItem);
    return newCartItem.toObject();
  }

  // If cart exists, update or add product
  let updatedList = [...cart.products_list];
  const index = updatedList.findIndex(
    (p) =>
      p.product_id.toString() === newProduct.product_id &&
      p.size === newProduct.size &&
      p.color === newProduct.color
  );

  if (index !== -1) {
    // Update quantity and subTotal
    updatedList[index].quantity += newProduct.qty;
    updatedList[index].subTotal =
      updatedList[index].quantity * newProduct.price;
  } else {
    // Add new product to list
    updatedList.push({
      product_id: newProduct.product_id,
      quantity: newProduct.qty,
      color: newProduct.color,
      size: newProduct.size,
      subTotal: subTotal,
    });
  }

  const total = updatedList.reduce((acc, item) => acc + item.subTotal, 0);

  const updatedCart = await repository.updateOne(
    CartModel,
    { _id: cart._id },
    { products_list: updatedList, total },
    { new: true }
  );

  return updatedCart.toObject();
};

/**
 * Get cart by user_id
 * @param user_id
 * @returns {Promise<*>}
 */
module.exports.getCartByUserId = async (user_id) => {
  const cart = await repository.findOne(CartModel, {
    user_id: user_id,
  });

  return cart;
};
