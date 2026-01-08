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
const stockService = require('../stock/stock.service');
const giftCardService = require('../giftcard/giftcard.service');
const emailService = require('../../services/email.service');
const emailTemplateService = require('../../services/email-template.service');
const SubOrderModel = require('../subOrder/suborder.model');
const UserModel = require('../users/user.model');

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
  // Platform fees are only applied to online payments, not COD or gift_card
  const buyerCharges = calculatePlatformCharges(subtotal, 'buyer', {
    shippingFee: 0, // Shipping handled separately per seller
    paymentMethod: paymentMethod === 'gift_card' ? 'cod' : paymentMethod, // Skip fees for gift_card (treat as COD for fee calculation)
  });

  // Calculate order total before gift card discount
  const orderTotalBeforeGiftCard = buyerCharges.finalTotal + totalShippingFee;

  // Apply gift cards if provided (but don't update gift cards yet - will do after order creation)
  let giftCardDiscount = 0;
  const appliedGiftCards = [];
  let remainingOrderTotal = orderTotalBeforeGiftCard;

  if (giftCards && giftCards.length > 0) {
    for (const { code } of giftCards) {
      try {
        // Validate gift card
        const giftCard = await giftCardService.validateGiftCard(code, user_id);
        
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

  // Store gift card codes temporarily for online payments (will be applied when payment succeeds)
  const giftCardCodesForOnlinePayment = 
    paymentMethod === 'card' && giftCards.length > 0
      ? giftCards.map((gc) => ({ code: gc.code }))
      : [];

  // Platform fees should NOT be stored if:
  // 1. Order is fully covered by gift cards (finalTotal <= 0, using <= to handle rounding)
  // 2. Payment method is COD (no fees for COD)
  // 3. Payment method is gift_card (fully covered by gift cards)
  // Platform fees only apply for online (card) payments when there's a remaining balance after gift cards
  const isFullyCovered = finalTotal <= 0 || paymentMethod === 'gift_card';
  const shouldStorePlatformCharges = !isFullyCovered && paymentMethod === 'card';

  // Create main order with dynamic platform charges
  const newOrder = new OrderModel({
    user_id: user_id,
    products_list: productsList,
    totalPrice: subtotal,
    platformCharges: shouldStorePlatformCharges 
      ? new Map(Object.entries(buyerCharges.charges))
      : new Map(),
    platformChargesObject: shouldStorePlatformCharges 
      ? buyerCharges.charges
      : {},
    platformChargesBreakdown: shouldStorePlatformCharges
      ? buyerCharges.chargesBreakdown
      : [],
    finalTotal: finalTotal,
    giftCardDiscount: giftCardDiscount,
    giftCards: appliedGiftCards,
    giftCardCodes: giftCardCodesForOnlinePayment, // Store codes temporarily for online payments
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

    // Reserve stock for this sub-order
    // For COD and Gift Card: Reserve immediately (payment is confirmed)
    // For Card Payment: Reserve now, will convert to sold when payment succeeds
    await stockService.reserveStockForSubOrder(subOrder._id, sellerProducts);

    // Send email notification to seller about new order
    // For online payments (card), skip email here - will be sent after payment confirmation
    // For COD and gift card, send immediately since payment is confirmed
    if (paymentMethod !== 'card') {
      try {
        const subOrderWithDetails = await SubOrderModel.findById(subOrder._id)
          .populate('seller_id', 'name email sellerInfo.businessName')
          .populate('buyer_id', 'name')
          .lean();

        if (subOrderWithDetails && subOrderWithDetails.seller_id && subOrderWithDetails.seller_id.email) {
          const emailTemplate = emailTemplateService.generateSellerNewOrderEmail(subOrderWithDetails);
          await emailService.sendEmail({
            to: subOrderWithDetails.seller_id.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
        }
      } catch (error) {
        // console.error(`Error sending new order email to seller ${sellerId}:`, error);
        // Don't fail the operation if email fails
      }
    }
  }

  // Apply gift cards to order and update gift card balances
  // Only apply immediately for COD and fully gift card payments
  // For online payments, defer until payment is successful
  if (appliedGiftCards.length > 0 && giftCards.length > 0) {
    // Only apply gift cards immediately if payment method is COD or fully gift card
    // For online payments (card), we'll apply them when payment succeeds
    if (paymentMethod === 'cod' || paymentMethod === 'gift_card') {
      let remainingOrderTotalForGiftCards = orderTotalBeforeGiftCard;
      for (let i = 0; i < appliedGiftCards.length; i++) {
        const giftCardInfo = appliedGiftCards[i];
        
        try {
          // Apply gift card with the remaining order total
          // The function will calculate the correct amount to apply
          await giftCardService.applyGiftCardToOrder(
            giftCardInfo.code,
            remainingOrderTotalForGiftCards,
            user_id,
            createdOrder._id.toString()
          );
          
          // Update remaining order total for next gift card
          remainingOrderTotalForGiftCards -= giftCardInfo.amountApplied;
          if (remainingOrderTotalForGiftCards <= 0) {
            break;
          }
        } catch (error) {
          // Log error but don't fail the order - gift card was already validated
          // console.error(`Error updating gift card ${giftCardInfo.code}:`, error);
        }
      }
    }
    // For online payments, gift cards will be applied in updatePaymentStatus when payment succeeds
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
  
  // For gift card payments, amount is 0 (fully covered)
  // For other payments, use the final total after gift card discount
  const paymentAmount = paymentMethod === 'gift_card' ? 0 : updatedOrder.finalTotal;
  
  const payment = await paymentService.createPayment({
    user_id,
    payment_method: paymentMethod,
    order_id: createdOrder._id,
    amount: paymentAmount,
  });

  if (!payment) {
    throw new Error('Error initializing payment process!');
  }

  return payment;
};

module.exports.findOrderById = async (order_id) => {
  const order = await OrderModel.findById(order_id)
    .populate('user_id', 'name email profilePicture')
    .lean();

  if (!order) {
    return null;
  }

  // Populate sub-orders with detailed data
  const subOrders = await subOrderService.getSubOrdersByMainOrder(order_id);

  // Convert to plain object and add sub-orders
  const orderObj = order;
  orderObj.sub_orders_details = subOrders;
  
  // Add user_info for admin/customer view
  if (order.user_id) {
    orderObj.user_info = {
      _id: order.user_id._id || order.user_id,
      name: order.user_id.name || 'Unknown User',
      email: order.user_id.email || 'N/A',
      profilePicture: order.user_id.profilePicture,
    };
  }
  
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

/**
 * Get all orders (for admin)
 * @param {Object} queryParams - Query parameters (page, limit, status, userId)
 * @returns {Promise<Object>}
 */
module.exports.getAllOrders = async (queryParams = {}) => {
  const { page = 1, limit = 10, status, userId } = queryParams;
  const skip = (page - 1) * limit;

  const filter = {};
  
  if (status) {
    filter.orderStatus = status;
  }

  if (userId) {
    filter.user_id = new mongoose.Types.ObjectId(userId);
  }

  // Find orders with pagination
  const orders = await OrderModel.find(filter)
    .populate('user_id', 'name email profilePicture')
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
        user_info: {
          _id: order.user_id?._id || order.user_id,
          name: order.user_id?.name || 'Unknown User',
          email: order.user_id?.email || 'N/A',
          profilePicture: order.user_id?.profilePicture,
        },
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