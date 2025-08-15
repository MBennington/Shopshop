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
  //console.log('product: ', product);

  if (!product) {
    throw new Error('Product not found!');
  }

  const subTotal = newProduct.qty * product.price;
  //console.log('subtotal: ', subTotal);

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
  //console.log('index: ', index);

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
      subtotal: subTotal,
    });
  }

  //console.log('updated list: ', updatedList);
  const total = updatedList.reduce((acc, item) => acc + item.subtotal, 0);

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
module.exports.getCartByUserId = async (userId) => {
  const cart = await CartModel.aggregate([
    {
      $match: { user_id: new mongoose.Types.ObjectId(userId) },
    },
    { $unwind: '$products_list' },
    {
      $lookup: {
        from: 'products',
        localField: 'products_list.product_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $addFields: {
        selectedColor: {
          $first: {
            $filter: {
              input: '$product.colors',
              as: 'c',
              cond: { $eq: ['$$c.colorCode', '$products_list.color'] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        'products_list.productName': '$product.name',
        'products_list.basePrice': '$product.price',
        'products_list.category': '$product.category',
        'products_list.images': '$selectedColor.images',
      },
    },
    {
      $project: {
        user_id: 1,
        total: 1,
        'products_list.product_id': 1,
        'products_list.quantity': 1,
        'products_list.subtotal': 1,
        'products_list.size': 1,
        'products_list.color': 1,
        'products_list.productName': 1,
        'products_list.basePrice': 1,
        'products_list.category': 1,
        'products_list.images': 1,
      },
    },
    {
      $group: {
        _id: '$_id',
        user_id: { $first: '$user_id' },
        total: { $first: '$total' },
        products_list: { $push: '$products_list' },
        created_at: { $first: '$created_at' },
        updated_at: { $first: '$updated_at' },
      },
    },
  ]);

  return cart[0] || null;
};
