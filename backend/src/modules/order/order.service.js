const OrderModel = require('./order.model');
const Cart = require('../cart/cart.model');
const Product = require('../products/product.model');
const repository = require('../../services/repository.service');
const {
  orderStatus,
  paymentStatus,
  paymentMethod,
} = require('../../config/order.config');

module.exports.createOrder = async (user_id, body) => {
  const { address, paymentMethod, fromCart, selectedProduct } = body;

  let productsList = [];
  let total = 0;

  if (fromCart) {
    // Order from Cart
    const cart = await Cart.findOne({ user_id: user_id }).populate(
      'products_list.product_id'
    );
    //console.log('cart', cart);

    if (!cart || cart.products_list.length === 0) {
      throw new Error('Cart is empty');
    }

    productsList = cart.products_list.map((item) => ({
      product_id: item.product_id._id,
      qty: item.quantity,
      color: item.color,
      size: item.size,
      subtotal: item.subtotal,
    }));

    total = cart.total;

    // Clear cart after order placed
    cart.products_list = [];
    cart.total = 0;
    await cart.save();
  } else {
    // Direct order for single product (Buy Now)
    const product = await Product.findById(selectedProduct.id);
    if (!product) throw new Error('Product not found');

    const subtotal = product.price * selectedProduct.quantity;

    const productData = {
      product_id: product._id,
      qty: selectedProduct.quantity,
      color: selectedProduct.color,
      subtotal,
    };

    if (selectedProduct.size && selectedProduct.size !== null) {
      productData = {
        ...productData,
        size: selectedProduct.size,
      };
    }

    console.log('product data: ', productData);

    productsList.push(productData);

    total = subtotal;
  }

  // Create order
  const newOrder = new OrderModel({
    user_id: user_id,
    products_list: productsList,
    totalPrice: total,
    shippingAddress: address,
    paymentMethod,
  });

  await repository.save(newOrder);
  return newOrder.toObject();
};
