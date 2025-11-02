const OrderModel = require('./order.model');
const Cart = require('../cart/cart.model');
const Product = require('../products/product.model');
const repository = require('../../services/repository.service');
const {
  orderStatus,
  paymentStatus,
  paymentMethod,
} = require('../../config/order.config');
const { platformCharges } = require('../../config/platform-charges.config');
const paymentService = require('../payment/payment.service');
const subOrderService = require('../subOrder/suborder.service');
const userService = require('../users/user.service');

module.exports.createOrder = async (user_id, body) => {
  const { address, paymentMethod, fromCart, product } = body;

  let productsList = [];
  let subtotal = 0;
  const buyer_transaction_fee_percentage =
    platformCharges.transaction_fee.buyer;

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
      seller_id: item.seller_id,
      qty: item.quantity,
      color: item.color,
      size: item.size,
      subtotal: item.subtotal,
    }));

    subtotal = cart.total;

    // Clear cart after order placed
    cart.products_list = [];
    cart.total = 0;
    await cart.save();
  } else {
    // Direct order for single product (Buy Now)
    const exsistingProduct = await Product.findById(product.product_id);
    if (!exsistingProduct) throw new Error('Product not found');

    const itemSubtotal = exsistingProduct.price * product.quantity;

    let productData = {
      product_id: exsistingProduct._id,
      seller_id: exsistingProduct.seller,
      qty: product.quantity,
      color: product.color,
      subtotal: itemSubtotal,
    };

    if (product.size && product.size !== null) {
      productData = {
        ...productData,
        size: product.size,
      };
    }

    //console.log('product data: ', productData);

    productsList.push(productData);
    // Set main order subtotal for Buy Now flow
    subtotal = itemSubtotal;
  }

  // Group products by seller
  const productsBySeller = productsList.reduce((acc, item) => {
    const sellerId = item.seller_id.toString();
    if (!acc[sellerId]) {
      acc[sellerId] = [];
    }
    acc[sellerId].push(item);
    return acc;
  }, {});

  // Calculate platform charges
  const transactionFee = subtotal * buyer_transaction_fee_percentage;
  const platformFee = 0; // Currently no platform fee for buyers

  // Create main order (finalTotal will be updated after calculating shipping)
  const newOrder = new OrderModel({
    user_id: user_id,
    products_list: productsList,
    totalPrice: subtotal,
    platformCharges: {
      transactionFee: transactionFee,
      platformFee: platformFee,
    },
    finalTotal: subtotal + transactionFee + platformFee, // Will be updated with shipping
    shippingAddress: address,
    paymentMethod,
  });

  const createdOrder = await repository.save(newOrder);
  if (!createdOrder) {
    throw new Error('Error initalizing order!');
  }

  // Create sub-orders for each seller
  const subOrders = [];
  let totalShippingFee = 0;
  
  for (const [sellerId, sellerProducts] of Object.entries(productsBySeller)) {
    // Fetch seller to get baseShippingFee
    const seller = await userService.getUserById(sellerId);
    const shippingFee = seller?.sellerInfo?.baseShippingFee ?? platformCharges.shipping_fee.default;
    
    const sellerSubtotal = sellerProducts.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const sellerTransactionFee =
      sellerSubtotal * buyer_transaction_fee_percentage;
    const sellerFinalTotal = sellerSubtotal + shippingFee + sellerTransactionFee;
    
    totalShippingFee += shippingFee;

    const subOrderData = {
      main_order_id: createdOrder._id,
      seller_id: sellerId,
      buyer_id: user_id,
      products_list: sellerProducts,
      shippingAddress: address,
      subtotal: sellerSubtotal,
      shipping_fee: shippingFee,
      platformCharges: {
        transactionFee: sellerTransactionFee,
        platformFee: 0,
      },
      finalTotal: sellerFinalTotal,
    };

    const subOrder = await subOrderService.createSubOrder(subOrderData);
    subOrders.push(subOrder);
  }

  // Update main order with shipping included in finalTotal
  const finalTotal = subtotal + totalShippingFee + transactionFee + platformFee;
  await repository.updateOne(
    OrderModel,
    { _id: createdOrder._id },
    { finalTotal: finalTotal },
    { new: true }
  );

  // Update main order with sub-order references
  await repository.updateOne(
    OrderModel,
    { _id: createdOrder._id },
    { sub_orders: subOrders.map((so) => so._id) },
    { new: true }
  );

  // Get updated order with correct finalTotal
  const updatedOrder = await repository.findOne(OrderModel, { _id: createdOrder._id });
  
  const payment = await paymentService.createPayment({
    user_id,
    payment_method: paymentMethod,
    order_id: createdOrder._id,
    amount: updatedOrder.finalTotal,
  });

  if (!payment) {
    throw new Error('Error initializing payment process!');
  }

  return payment;
};

module.exports.findOrderById = async (order_id) => {
  const order = await repository.findOne(OrderModel, { _id: order_id });

  if (!order) {
    return null;
  }

  // Populate sub-orders with detailed data
  const subOrders = await subOrderService.getSubOrdersByMainOrder(order_id);

  // Convert to plain object and add sub-orders
  const orderObj = order.toObject();
  orderObj.sub_orders_details = subOrders;
  
  // Remove redundant products_list since we only display sub-orders
  delete orderObj.products_list;

  return orderObj;
};
