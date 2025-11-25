const mongoose = require('mongoose');
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
const { calculatePlatformCharges } = require('../../services/platform-charges.service');
const stockService = require('../../services/stock.service');
const giftCardService = require('../giftcard/giftcard.service');

module.exports.createOrder = async (user_id, body) => {
  const { address, paymentMethod, fromCart, product, giftCards = [] } = body;

  let productsList = [];
  let subtotal = 0;

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

    // Don't clear cart here - will be cleared after payment confirmation
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

  // Validate stock availability before creating order
  const stockValidation = await stockService.validateStockAvailability(productsList);
  if (!stockValidation.isValid) {
    throw new Error(stockValidation.errors.join('; '));
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

  // Calculate shipping fees for all sellers first
  let totalShippingFee = 0;
  const sellerShippingFees = {};
  
  for (const [sellerId] of Object.entries(productsBySeller)) {
    const seller = await userService.getUserById(sellerId);
    const shippingFee = seller?.sellerInfo?.baseShippingFee ?? platformCharges.shipping_fee.default;
    sellerShippingFees[sellerId] = shippingFee;
    totalShippingFee += shippingFee;
  }

  // Calculate platform charges for buyer (main order level)
  // Note: Shipping is handled per seller, not in main order charges
  // Platform fees are only applied to online payments, not COD
  const buyerCharges = calculatePlatformCharges(subtotal, 'buyer', {
    shippingFee: 0, // Shipping handled separately per seller
    paymentMethod: paymentMethod, // Pass payment method to skip fees for COD
  });

  // Calculate order total before gift card discount
  const orderTotalBeforeGiftCard = buyerCharges.finalTotal + totalShippingFee;

  // Apply gift cards if provided (but don't update gift cards yet - will do after order creation)
  let giftCardDiscount = 0;
  const appliedGiftCards = [];
  let remainingOrderTotal = orderTotalBeforeGiftCard;

  if (giftCards && giftCards.length > 0) {
    for (const { code, pin } of giftCards) {
      try {
        // Validate gift card with PIN
        const giftCard = await giftCardService.validateGiftCard(code, pin, user_id);
        
        const applied = Math.min(giftCard.remainingBalance, remainingOrderTotal);
        giftCardDiscount += applied;
        remainingOrderTotal -= applied;
        
        appliedGiftCards.push({
          code: giftCard.code,
          amountApplied: applied,
          remainingBalance: giftCard.remainingBalance - applied,
        });

        // Stop if order is fully covered
        if (remainingOrderTotal <= 0) {
          break;
        }
      } catch (error) {
        // Throw error to prevent order creation with invalid gift card
        throw new Error(`Gift card ${code}: ${error.message}`);
      }
    }
  }

  // Final total after gift card discount
  const finalTotal = Math.max(0, remainingOrderTotal);

  // Create main order with dynamic platform charges
  const newOrder = new OrderModel({
    user_id: user_id,
    products_list: productsList,
    totalPrice: subtotal,
    platformCharges: new Map(Object.entries(buyerCharges.charges)),
    platformChargesObject: buyerCharges.charges,
    platformChargesBreakdown: buyerCharges.chargesBreakdown,
    finalTotal: finalTotal,
    giftCardDiscount: giftCardDiscount,
    giftCards: appliedGiftCards,
    shippingAddress: address,
    paymentMethod,
  });

  const createdOrder = await repository.save(newOrder);
  if (!createdOrder) {
    throw new Error('Error initalizing order!');
  }

  // Create sub-orders for each seller
  const subOrders = [];
  
  for (const [sellerId, sellerProducts] of Object.entries(productsBySeller)) {
    const sellerSubtotal = sellerProducts.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    
    // Get shipping fee from pre-calculated values
    const shippingFee = sellerShippingFees[sellerId];
    
    // Seller total = products + shipping (platform fees are buyer fees, calculated at main order level only)
    const sellerFinalTotal = sellerSubtotal + shippingFee;

    const subOrderData = {
      main_order_id: createdOrder._id,
      seller_id: sellerId,
      buyer_id: user_id,
      products_list: sellerProducts,
      shippingAddress: address,
      subtotal: sellerSubtotal,
      shipping_fee: shippingFee,
      // Platform charges are buyer fees only, not stored in sub-orders
      // Sellers only see their seller total (products + shipping)
      finalTotal: sellerFinalTotal,
    };

    const subOrder = await subOrderService.createSubOrder(subOrderData);
    subOrders.push(subOrder);
  }

  // Apply gift cards to order and update gift card balances
  if (appliedGiftCards.length > 0 && giftCards.length > 0) {
    let remainingOrderTotalForGiftCards = orderTotalBeforeGiftCard;
    for (let i = 0; i < appliedGiftCards.length; i++) {
      const giftCardInfo = appliedGiftCards[i];
      const giftCardData = giftCards[i]; // Get PIN from original request
      
      try {
        // Apply gift card with the remaining order total and PIN
        // The function will calculate the correct amount to apply
        await giftCardService.applyGiftCardToOrder(
          giftCardInfo.code,
          giftCardData.pin,
          remainingOrderTotalForGiftCards,
          user_id,
          createdOrder._id
        );
        
        // Update remaining order total for next gift card
        remainingOrderTotalForGiftCards -= giftCardInfo.amountApplied;
        if (remainingOrderTotalForGiftCards <= 0) {
          break;
        }
      } catch (error) {
        // Log error but don't fail the order - gift card was already validated
        console.error(`Error updating gift card ${giftCardInfo.code}:`, error);
      }
    }
  }

  // Note: finalTotal already includes gift card discount, so no need to recalculate

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
    amount: updatedOrder.finalTotal, // This already includes gift card discount
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

module.exports.getOrdersByUser = async (user_id, queryParams = {}) => {
  const { page = 1, limit = 10, status } = queryParams;
  const skip = (page - 1) * limit;

  const filter = { user_id: new mongoose.Types.ObjectId(user_id) };
  
  if (status) {
    filter.orderStatus = status;
  }

  // Find orders with pagination
  const orders = await OrderModel.find(filter)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count for pagination
  const total = await OrderModel.countDocuments(filter);

  // For each order, get a summary of sub-orders (just count and status)
  const ordersWithSummary = await Promise.all(
    orders.map(async (order) => {
      const subOrders = await subOrderService.getSubOrdersByMainOrder(order._id.toString());
      
      return {
        ...order,
        sub_orders_count: subOrders.length,
        sub_orders_summary: subOrders.map(so => ({
          _id: so._id,
          orderStatus: so.orderStatus,
          seller_name: so.seller_info?.businessName || so.seller_info?.name || 'Unknown Seller',
        })),
      };
    })
  );

  return {
    orders: ordersWithSummary,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};