const mongoose = require('mongoose');
const SubOrderModel = require('./suborder.model');
const OrderModel = require('../order/order.model');
const PaymentModel = require('../payment/payment.model');
const UserModel = require('../users/user.model');
const repository = require('../../services/repository.service');
const {
  subOrderStatus,
  sellerPaymentStatus,
  deliveryStatus,
  AUTO_CONFIRM_DELIVERY_THRESHOLD_DAYS,
} = require('../../config/suborder.config');
const {
  orderStatus,
  paymentMethod,
  paymentStatus,
} = require('../../config/order.config');
const { roles } = require('../../config/role.config');
const stockService = require('../stock/stock.service');
const emailService = require('../../services/email.service');
const emailTemplateService = require('../../services/email-template.service');
const sellerWalletService = require('../sellerWallet/seller-wallet.service');

/**
 * Update seller wallet when delivery is confirmed
 * Moves seller share from pending to available balance
 * @param {Object} subOrder - Sub-order object (can be lean or full)
 * @returns {Promise<void>}
 */
module.exports.updateWalletOnDeliveryConfirmation = async (subOrder) => {
  try {
    // Only update wallet if delivery is confirmed and order is delivered
    if (!subOrder.delivery_confirmed || subOrder.orderStatus !== subOrderStatus.DELIVERED) {
      return;
    }

    // Check if this is an online payment (not COD)
    // For COD, customer pays directly to seller, so no wallet update needed
    const mainOrder = await OrderModel.findById(subOrder.main_order_id).lean();
    if (mainOrder && mainOrder.paymentMethod === paymentMethod.COD) {
      return; // Skip wallet update for COD
    }

    const sellerId = subOrder.seller_id?.toString() || subOrder.seller_id;
    const sellerShare = subOrder.finalTotal || 0;

    if (sellerShare > 0 && sellerId) {
      await sellerWalletService.movePendingToAvailable(sellerId, sellerShare);
      console.log(`Moved ${sellerShare} from pending to available for seller ${sellerId} (delivery confirmed)`);
    }
  } catch (error) {
    console.error(`Error updating wallet on delivery confirmation:`, error);
    // Don't fail the delivery confirmation if wallet update fails
  }
};

/**
 * Sync main order status with sub-orders status
 * Updates main order status if all non-cancelled sub-orders have the same status
 * @param {String} mainOrderId
 * @returns {Promise<void>}
 */
module.exports.syncMainOrderStatusWithSubOrders = async (mainOrderId) => {
  if (!mainOrderId || !mongoose.Types.ObjectId.isValid(mainOrderId)) {
    return;
  }

  try {
    // Get all sub-orders for this main order (excluding cancelled ones)
    const allSubOrders = await SubOrderModel.find({
      main_order_id: new mongoose.Types.ObjectId(mainOrderId),
      orderStatus: { $ne: subOrderStatus.CANCELLED }, // Exclude cancelled sub-orders
    }).lean();

    // If no non-cancelled sub-orders exist, don't update
    if (!allSubOrders || allSubOrders.length === 0) {
      return;
    }

    // Get the status of the first sub-order
    const firstStatus = allSubOrders[0].orderStatus;

    // Check if all non-cancelled sub-orders have the same status
    const allSameStatus = allSubOrders.every(
      (subOrder) => subOrder.orderStatus === firstStatus
    );

    // If all non-cancelled sub-orders have the same status, update main order status
    if (allSameStatus) {
      // Map sub-order status to main order status
      let mainOrderStatus;
      switch (firstStatus) {
        case subOrderStatus.PENDING:
          mainOrderStatus = orderStatus.PENDING;
          break;
        case subOrderStatus.PROCESSING:
          mainOrderStatus = orderStatus.PROCESSING;
          break;
        case subOrderStatus.PACKED:
          mainOrderStatus = orderStatus.PACKED;
          break;
        case subOrderStatus.DISPATCHED:
          mainOrderStatus = orderStatus.DISPATCHED;
          break;
        case subOrderStatus.DELIVERED:
          mainOrderStatus = orderStatus.DELIVERED;
          break;
        default:
          // Default to PENDING for any other status
          mainOrderStatus = orderStatus.PENDING;
      }

      await repository.updateOne(
        OrderModel,
        { _id: new mongoose.Types.ObjectId(mainOrderId) },
        { orderStatus: mainOrderStatus },
        { new: true }
      );

      // If all sub-orders are delivered and payment method is COD, update payment status to PAID
      if (firstStatus === subOrderStatus.DELIVERED) {
        // Use OrderModel directly for populate support
        const mainOrder = await OrderModel.findOne({
          _id: new mongoose.Types.ObjectId(mainOrderId),
        })
          .populate('user_id', 'name email')
          .lean();

        // Send order delivered email to buyer
        try {
          if (mainOrder && mainOrder.user_id && mainOrder.user_id.email) {
            const emailTemplate = emailTemplateService.generateOrderDeliveredEmail(mainOrder);
            await emailService.sendEmail({
              to: mainOrder.user_id.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
            });
          }
        } catch (error) {
          console.error(`Error sending order delivered email to buyer for order ${mainOrderId}:`, error);
          // Don't fail the operation if email fails
        }

        if (mainOrder && mainOrder.paymentMethod === paymentMethod.COD) {
          // Update payment record
          await repository.updateOne(
            PaymentModel,
            { order_id: new mongoose.Types.ObjectId(mainOrderId) },
            { paymentStatus: paymentStatus.PAID },
            { new: true }
          );

          // Update main order payment status
          await repository.updateOne(
            OrderModel,
            { _id: new mongoose.Types.ObjectId(mainOrderId) },
            { paymentStatus: paymentStatus.PAID },
            { new: true }
          );
          // Note: COD payments are handled directly between customer and seller, 
          // so no wallet updates needed
        }
      }
    }
  } catch (error) {
    console.error(
      `Error syncing main order status for order ${mainOrderId}:`,
      error
    );
    // Don't throw - this is a background sync operation
  }
};

/**
 * Create new sub-order
 * @param {Object} subOrderData
 * @returns {Promise<Object>}
 */
module.exports.createSubOrder = async (subOrderData) => {
  const newSubOrder = new SubOrderModel(subOrderData);
  return await repository.save(newSubOrder);
};

/**
 * Get sub-orders by main order ID with populated product and seller details
 * @param {String} mainOrderId
 * @returns {Promise<Array>}
 */
module.exports.getSubOrdersByMainOrder = async (mainOrderId) => {
  //console.log('Getting sub-orders for main order:', mainOrderId);

  // Check if mainOrderId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(mainOrderId)) {
    console.error('Invalid ObjectId:', mainOrderId);
    return [];
  }

  // First, let's see what sub-orders exist
  const rawSubOrders = await SubOrderModel.find({
    main_order_id: mainOrderId,
  }).lean();
  //console.log('Raw sub-orders found:', rawSubOrders.length);
  //console.log('Raw sub-orders data:', JSON.stringify(rawSubOrders, null, 2));

  // Now try with populate
  const subOrders = await SubOrderModel.find({ main_order_id: mainOrderId })
    .populate('seller_id', 'name profilePicture sellerInfo.businessName')
    .populate('products_list.product_id', 'name')
    .lean();

  //console.log('Populated sub-orders:', JSON.stringify(subOrders, null, 2));

  // Transform the data to match expected structure
  const transformedSubOrders = subOrders.map((subOrder) => {
    return {
      ...subOrder,
      seller_info: {
        ...subOrder.seller_id,
        businessName: subOrder.seller_id?.sellerInfo?.businessName,
      },
      products_list: subOrder.products_list.map((product) => ({
        ...product,
        product_name: product.product_id?.name || 'Product Name Not Available',
      })),
      // Platform charges are buyer fees only, not stored in sub-orders
      // Sub-orders only contain seller totals (products + shipping)
    };
  });

  // console.log(
  //   'Transformed sub-orders:',
  //   JSON.stringify(transformedSubOrders, null, 2)
  // );
  return transformedSubOrders;
};

/**
 * Get sub-orders by seller ID with pagination and filtering
 * @param {String} sellerId
 * @param {Object} queryParams
 * @returns {Promise<Array>}
 */
module.exports.getSubOrdersBySeller = async (sellerId, queryParams) => {
  const { page = 1, limit = 10, status, search } = queryParams;

  const filter = { seller_id: new mongoose.Types.ObjectId(sellerId) };
  if (status) {
    filter.orderStatus = status;
  }

  if (search && search.trim()) {
    const q = search.trim();
    const orConditions = [];
    if (mongoose.Types.ObjectId.isValid(q) && String(new mongoose.Types.ObjectId(q)) === q) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(q) });
      orConditions.push({ main_order_id: new mongoose.Types.ObjectId(q) });
    }
    const searchRegex = { $regex: q, $options: 'i' };
    const buyers = await UserModel.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
    })
      .select('_id')
      .lean();
    const buyerIds = buyers.map((b) => b._id);
    if (buyerIds.length > 0) {
      orConditions.push({ buyer_id: { $in: buyerIds } });
    }
    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }
  }

  const skip = (page - 1) * limit;

  // Find sub-orders with populated buyer, product, and main order information
  const subOrders = await SubOrderModel.find(filter)
    .populate('buyer_id', 'name email profilePicture')
    .populate('main_order_id', 'paymentMethod paymentStatus orderStatus')
    .populate('products_list.product_id', 'name images price colors')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get payment information for each main order
  const mainOrderIds = [
    ...new Set(
      subOrders.map((so) => so.main_order_id?._id || so.main_order_id)
    ),
  ];
  const payments = await PaymentModel.find({
    order_id: { $in: mainOrderIds },
  }).lean();

  // Create a map of order_id to payment
  const paymentMap = {};
  payments.forEach((payment) => {
    const orderId = payment.order_id?.toString() || payment.order_id;
    paymentMap[orderId] = payment;
  });

  // Transform the data to match expected structure
  const transformedSubOrders = subOrders.map((subOrder) => {
    const mainOrderId =
      subOrder.main_order_id?._id?.toString() ||
      subOrder.main_order_id?.toString() ||
      subOrder.main_order_id;
    const payment = paymentMap[mainOrderId];

    return {
      ...subOrder,
      buyer_info: {
        _id: subOrder.buyer_id?._id,
        name: subOrder.buyer_id?.name,
        email: subOrder.buyer_id?.email,
        profilePicture: subOrder.buyer_id?.profilePicture,
      },
      main_order_info: {
        _id: subOrder.main_order_id?._id || subOrder.main_order_id,
        paymentMethod: subOrder.main_order_id?.paymentMethod,
        paymentStatus: subOrder.main_order_id?.paymentStatus,
        orderStatus: subOrder.main_order_id?.orderStatus,
      },
      payment_info: payment
        ? {
            paymentMethod: payment.paymentMethod,
            paymentStatus: payment.paymentStatus,
            amount: payment.amount,
            payhere_payment_id: payment.payhere_payment_id,
            method: payment.method,
            status_message: payment.status_message,
            created_at: payment.created_at,
            updated_at: payment.updated_at,
          }
        : null,
      products_list: subOrder.products_list.map((product) => ({
        ...product,
        product_name: product.product_id?.name || 'Product Name Not Available',
        product_price: product.product_id?.price || 0,
        product_images: product.product_id?.images || [],
      })),
    };
  });

  return transformedSubOrders;
};

/**
 * Get distinct customers (buyers) for a seller from sub-orders, with optional search
 * @param {String} sellerId
 * @param {Object} queryParams - { search }
 * @returns {Promise<Array<{ _id, name, email, orderCount, lastOrderAt }>>}
 */
module.exports.getSellerCustomers = async (sellerId, queryParams = {}) => {
  const { search } = queryParams;
  const matchStage = { seller_id: new mongoose.Types.ObjectId(sellerId) };
  if (search && search.trim()) {
    const searchRegex = { $regex: search.trim(), $options: 'i' };
    const buyers = await UserModel.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
    })
      .select('_id')
      .lean();
    const buyerIds = buyers.map((b) => b._id);
    if (buyerIds.length === 0) return [];
    matchStage.buyer_id = { $in: buyerIds };
  }
  const aggregated = await SubOrderModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$buyer_id',
        orderCount: { $sum: 1 },
        lastOrderAt: { $max: '$created_at' },
      },
    },
    { $sort: { lastOrderAt: -1 } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: '$_id',
        name: '$user.name',
        email: '$user.email',
        orderCount: 1,
        lastOrderAt: 1,
      },
    },
  ]);
  return aggregated.map((row) => ({
    _id: row._id?.toString(),
    name: row.name || '—',
    email: row.email || '—',
    orderCount: row.orderCount || 0,
    lastOrderAt: row.lastOrderAt,
  }));
};

/**
 * Update sub-order status
 * @param {String} subOrderId
 * @param {Object} statusData
 * @returns {Promise<Object>}
 */
module.exports.updateSubOrderStatus = async (subOrderId, statusData) => {
  // Get the sub-order before update to check if it's being cancelled
  const existingSubOrder = await repository.findOne(SubOrderModel, {
    _id: subOrderId,
  });

  // Special handling for "delivered" status - seller marks as delivered
  // Don't update orderStatus directly, instead set seller_marked_as_delivered
  if (statusData.orderStatus === subOrderStatus.DELIVERED) {
    const updateData = {
      seller_marked_as_delivered: true,
      seller_marked_as_delivered_at: new Date(),
      // Don't update orderStatus - keep it as current status (usually "dispatched")
    };

    // Update the sub-order with seller delivery marking
    const updatedSubOrder = await repository.updateOne(
      SubOrderModel,
      { _id: subOrderId },
      updateData,
      { new: true }
    );

    // Populate buyer info for email
    const subOrderWithBuyer = await SubOrderModel.findById(subOrderId)
      .populate('buyer_id', 'name email')
      .populate('seller_id', 'name')
      .lean();

    // Send email to buyer to confirm delivery
    try {
      const emailTemplate =
        emailTemplateService.generateBuyerDeliveryConfirmationEmail(subOrderWithBuyer);
      await emailService.sendEmail({
        to: subOrderWithBuyer.buyer_id?.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (error) {
      console.error(
        `Error sending delivery confirmation email to buyer:`,
        error
      );
      // Don't fail the operation if email fails
    }

    return updatedSubOrder;
  }

  // For all other statuses, update normally
  const updatedSubOrder = await repository.updateOne(
    SubOrderModel,
    { _id: subOrderId },
    statusData,
    { new: true }
  );

  // If sub-order is being cancelled and it wasn't cancelled before, restore stock
  if (
    statusData.orderStatus === subOrderStatus.CANCELLED &&
    existingSubOrder &&
    existingSubOrder.orderStatus !== subOrderStatus.CANCELLED
  ) {
    try {
      await stockService.restoreStockFromCancelledSubOrder(subOrderId);
    } catch (error) {
      console.error(
        `Error restoring stock for cancelled sub-order ${subOrderId}:`,
        error
      );
    }
  }

  // Sync main order status with sub-orders after status update
  if (statusData.orderStatus && updatedSubOrder) {
    const mainOrderId = updatedSubOrder.main_order_id;
    if (mainOrderId) {
      await module.exports.syncMainOrderStatusWithSubOrders(mainOrderId);
    }
  }

  return updatedSubOrder;
};

/**
 * Update seller payment status
 * @param {String} subOrderId
 * @param {String} paymentStatus
 * @returns {Promise<Object>}
 */
module.exports.updateSellerPaymentStatus = async (
  subOrderId,
  paymentStatus
) => {
  return await repository.updateOne(
    SubOrderModel,
    { _id: subOrderId },
    { seller_payment_status: paymentStatus },
    { new: true }
  );
};

/**
 * Confirm delivery for sub-order
 * @param {String} subOrderId
 * @param {Boolean} confirmed
 * @returns {Promise<Object>}
 */
module.exports.confirmDelivery = async (subOrderId, confirmed) => {
  const updateData = {
    delivery_confirmed: confirmed,
    delivery_status: confirmed
      ? deliveryStatus.CONFIRMED
      : deliveryStatus.PENDING,
  };

  if (confirmed) {
    updateData.delivery_confirmed_at = new Date();
  }

  return await repository.updateOne(
    SubOrderModel,
    { _id: subOrderId },
    updateData,
    { new: true }
  );
};

/**
 * Buyer confirms delivery
 * @param {String} subOrderId
 * @param {Boolean} confirmed - true if buyer received the order
 * @param {String} user_id - ID of the authenticated user
 * @returns {Promise<Object>}
 */
module.exports.buyerConfirmDelivery = async (
  subOrderId,
  confirmed,
  user_id
) => {
  // Get current sub-order to check status
  const subOrder = await SubOrderModel.findById(subOrderId)
    .populate('buyer_id', 'name email')
    .populate('seller_id', 'sellerInfo.businessName')
    .lean();

  if (!subOrder) {
    throw new Error('Sub-order not found');
  }

  console.log('suborder: ', subOrder);

  // Check if the authenticated user is the buyer
  const buyerId = user_id;
  const subOrderBuyerId =
    subOrder.buyer_id._id?.toString() || subOrder.buyer_id._id;

  if (buyerId !== subOrderBuyerId) {
    throw new Error('You can only confirm delivery for your own orders');
  }

  // Only handle confirmation (confirmed = true)
  // Dispute flow has been removed - users should use the report issue page instead
  if (!confirmed) {
    throw new Error('Invalid request. Please use the report issue page if you have concerns about your order.');
  }

  // Buyer confirms delivery
  const updateData = {
    delivery_confirmed: true,
    delivery_confirmed_at: new Date(),
    delivery_status: deliveryStatus.CONFIRMED,
  };

  // Check current orderStatus - only update if not already delivered
  if (subOrder.orderStatus !== subOrderStatus.DELIVERED) {
    updateData.orderStatus = subOrderStatus.DELIVERED;
    updateData.notes = 'Buyer confirmed the order through email';
  }

  const updatedSubOrder = await repository.updateOne(
    SubOrderModel,
    { _id: subOrderId },
    updateData,
    { new: true }
  );

  // If orderStatus was updated to delivered, sync main order
  // The sync function will handle COD payment status update if all suborders are delivered
  if (updateData.orderStatus === subOrderStatus.DELIVERED && updatedSubOrder) {
    const mainOrderId = subOrder.main_order_id;

    if (mainOrderId) {
      // Sync main order status with sub-orders (includes COD payment status update)
      await module.exports.syncMainOrderStatusWithSubOrders(mainOrderId);
    }

    // Move seller share from pending to available balance when delivery is confirmed
    const updatedSubOrderData = updatedSubOrder.toObject ? updatedSubOrder.toObject() : updatedSubOrder;
    await module.exports.updateWalletOnDeliveryConfirmation(updatedSubOrderData);
  }

  return updatedSubOrder;
};

/**
 * Auto-confirm delivery after threshold period
 * System automatically confirms delivery if seller marked as delivered and threshold days have passed
 * @param {String} subOrderId
 * @param {Number} thresholdDays - Number of days threshold (default from config)
 * @returns {Promise<Object|null>}
 */
module.exports.autoConfirmDeliveryAfterThreshold = async (
  subOrderId,
  thresholdDays
) => {
  try {
    // Get threshold from config if not provided
    const daysThreshold = thresholdDays || AUTO_CONFIRM_DELIVERY_THRESHOLD_DAYS;

    // Get current sub-order
    const subOrder = await SubOrderModel.findById(subOrderId).lean();

    if (!subOrder) {
      throw new Error('Sub-order not found');
    }

    // Validate conditions
    if (subOrder.delivery_status !== deliveryStatus.PENDING) {
      // Already confirmed or disputed, skip
      return null;
    }

    if (!subOrder.seller_marked_as_delivered) {
      // Seller hasn't marked as delivered, skip
      return null;
    }

    if (!subOrder.seller_marked_as_delivered_at) {
      // Missing timestamp, skip
      return null;
    }

    // Calculate days since seller marked as delivered
    const markedDate = new Date(subOrder.seller_marked_as_delivered_at);
    const currentDate = new Date();
    const daysDiff = Math.floor(
      (currentDate - markedDate) / (1000 * 60 * 60 * 24)
    );

    // Check if threshold has been reached
    if (daysDiff < daysThreshold) {
      // Threshold not reached yet, skip
      return null;
    }

    // Build update data
    const updateData = {
      delivery_confirmed: true,
      delivery_confirmed_at: new Date(),
      delivery_status: deliveryStatus.CONFIRMED,
    };

    // Update orderStatus to DELIVERED if not already
    if (subOrder.orderStatus !== subOrderStatus.DELIVERED) {
      updateData.orderStatus = subOrderStatus.DELIVERED;
    }

    // Build note message
    const markedDateStr = markedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const systemMessage = `System automatically confirmed delivery after ${daysThreshold} days threshold (seller marked as delivered on ${markedDateStr}).`;
    
    // Preserve existing notes if present
    if (subOrder.notes) {
      updateData.notes = `${systemMessage} Original note: ${subOrder.notes}`;
    } else {
      updateData.notes = systemMessage;
    }

    // Update the sub-order
    const updatedSubOrder = await repository.updateOne(
      SubOrderModel,
      { _id: subOrderId },
      updateData,
      { new: true }
    );

    // If orderStatus was updated to delivered, sync main order
    // The sync function will handle COD payment status update if all suborders are delivered
    if (updateData.orderStatus === subOrderStatus.DELIVERED && updatedSubOrder) {
      const mainOrderId = subOrder.main_order_id;

      if (mainOrderId) {
        // Sync main order status with sub-orders (includes COD payment status update)
        await module.exports.syncMainOrderStatusWithSubOrders(mainOrderId);
      }

      // Move seller share from pending to available balance when delivery is confirmed
      const updatedSubOrderData = updatedSubOrder.toObject ? updatedSubOrder.toObject() : updatedSubOrder;
      await module.exports.updateWalletOnDeliveryConfirmation(updatedSubOrderData);
    }

    return updatedSubOrder;
  } catch (error) {
    console.error(
      `Error auto-confirming delivery for sub-order ${subOrderId}:`,
      error
    );
    throw error;
  }
};

/**
 * Get sub-order by ID with populated details
 * @param {String} subOrderId
 * @returns {Promise<Object>}
 */
module.exports.getSubOrderById = async (subOrderId) => {
  const subOrder = await SubOrderModel.findById(subOrderId)
    .populate('buyer_id', 'name email profilePicture')
    .populate('seller_id', 'name profilePicture sellerInfo.businessName')
    .populate('main_order_id', 'paymentMethod paymentStatus orderStatus')
    .populate('products_list.product_id', 'name images price colors')
    .lean();

  if (!subOrder) {
    return null;
  }

  // Get payment information
  const mainOrderId =
    subOrder.main_order_id?._id?.toString() ||
    subOrder.main_order_id?.toString() ||
    subOrder.main_order_id;
  const payment = await PaymentModel.findOne({
    order_id: mainOrderId,
  }).lean();

  // Transform the data to match expected structure
  return {
    ...subOrder,
    buyer_info: {
      _id: subOrder.buyer_id?._id,
      name: subOrder.buyer_id?.name,
      email: subOrder.buyer_id?.email,
      profilePicture: subOrder.buyer_id?.profilePicture,
    },
    seller_info: {
      ...subOrder.seller_id,
      businessName: subOrder.seller_id?.sellerInfo?.businessName,
    },
    main_order_info: {
      _id: subOrder.main_order_id?._id || subOrder.main_order_id,
      paymentMethod: subOrder.main_order_id?.paymentMethod,
      paymentStatus: subOrder.main_order_id?.paymentStatus,
      orderStatus: subOrder.main_order_id?.orderStatus,
    },
    payment_info: payment
      ? {
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          amount: payment.amount,
          payhere_payment_id: payment.payhere_payment_id,
          method: payment.method,
          status_message: payment.status_message,
          created_at: payment.created_at,
          updated_at: payment.updated_at,
        }
      : null,
    products_list: subOrder.products_list.map((product) => ({
      ...product,
      product_name: product.product_id?.name || 'Product Name Not Available',
      product_price: product.product_id?.price || 0,
      product_images: product.product_id?.images || [],
    })),
  };
};

/**
 * Get suborders for a user that contain a specific product
 * Used for review eligibility checking
 * @param {String} userId
 * @param {String} productId
 * @returns {Promise<Array>}
 */
module.exports.getUserSubOrdersForProduct = async (userId, productId) => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
    return [];
  }

  // Find suborders where:
  // 1. buyer_id matches userId
  // 2. products_list contains the productId
  const subOrders = await SubOrderModel.find({
    buyer_id: new mongoose.Types.ObjectId(userId),
    'products_list.product_id': new mongoose.Types.ObjectId(productId),
  })
    .select('_id orderStatus products_list main_order_id')
    .lean();

  return subOrders;
};