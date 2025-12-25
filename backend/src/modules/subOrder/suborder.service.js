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
} = require('../../config/suborder.config');
const {
  orderStatus,
  paymentMethod,
  paymentStatus,
} = require('../../config/order.config');
const { roles } = require('../../config/role.config');
const stockService = require('../../services/stock.service');
const emailService = require('../../services/email.service');

/**
 * Generate email template for buyer delivery confirmation request
 * @param {Object} subOrder - SubOrder with populated buyer and product info
 * @returns {Object} - { subject, html }
 */
const generateBuyerDeliveryConfirmationEmail = (subOrder) => {
  const subOrderId = subOrder._id.toString();
  const confirmUrl = `${emailService.FRONTEND_URL}/order/confirm-delivery?subOrderId=${subOrderId}&confirmed=true`;
  const disputeUrl = `${emailService.FRONTEND_URL}/order/confirm-delivery?subOrderId=${subOrderId}&confirmed=false`;
  const buyerName = subOrder.buyer_id?.name || 'Customer';
  const orderId = subOrderId.slice(-8);
  const trackingNumber = subOrder.tracking_number || 'N/A';

  const subject = 'Please Confirm Your Order Delivery';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your Order Delivery</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #121416 0%, #2a2d30 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">📦 Order Delivery Confirmation</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${buyerName},</p>
        
        <p style="font-size: 16px;">
          The seller has marked your order as delivered. Please confirm if you have received your package.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #121416;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
            ✅ Yes, I Received It
          </a>
          <a href="${disputeUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            ❌ No, I Did Not Receive It
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          If you have any questions or concerns, please contact our support team.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email from Shopshop. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

/**
 * Generate email template for admin notification when buyer disputes delivery
 * @param {Object} subOrder - SubOrder with populated buyer, seller, and product info
 * @returns {Object} - { subject, html }
 */
const generateAdminDisputeNotificationEmail = (subOrder) => {
  const subOrderId = subOrder._id.toString();
  const orderId = subOrderId.slice(-8);
  const buyerName = subOrder.buyer_id?.name || 'Unknown';
  const buyerEmail = subOrder.buyer_id?.email || 'Unknown';
  const sellerName = subOrder.seller_id?.name || 'Unknown';
  const currentStatus = subOrder.orderStatus || 'Unknown';

  const subject = `⚠️ Delivery Dispute - Order ${orderId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Delivery Dispute Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">⚠️ Delivery Dispute Alert</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">A buyer has reported that they did not receive their order.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #ef4444;">Order Details</h3>
          <p style="margin: 5px 0;"><strong>Sub-Order ID:</strong> ${orderId}</p>
          <p style="margin: 5px 0;"><strong>Current Order Status:</strong> ${currentStatus}</p>
          <p style="margin: 5px 0;"><strong>Buyer Feedback:</strong> Not received</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Buyer Information</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${buyerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${buyerEmail}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Seller Information</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${sellerName}</p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Please review this case and take appropriate action.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated notification from Shopshop.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
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
        const mainOrder = await repository.findOne(OrderModel, {
          _id: new mongoose.Types.ObjectId(mainOrderId),
        });

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
  const { page = 1, limit = 10, status } = queryParams;

  const filter = { seller_id: new mongoose.Types.ObjectId(sellerId) };
  if (status) {
    filter.orderStatus = status;
  }

  const skip = (page - 1) * limit;

  // Find sub-orders with populated buyer, product, and main order information
  const subOrders = await SubOrderModel.find(filter)
    .populate('buyer_id', 'name email profilePicture')
    .populate('main_order_id', 'paymentMethod paymentStatus orderStatus')
    .populate('products_list.product_id', 'name images price')
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
        generateBuyerDeliveryConfirmationEmail(subOrderWithBuyer);
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
 * Buyer confirms or disputes delivery
 * @param {String} subOrderId
 * @param {Boolean} confirmed - true if buyer received, false if not received
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
  //console.log('buyer: ', buyerId);
  //console.log('subOrderBuyerId: ', subOrderBuyerId);

  if (buyerId !== subOrderBuyerId) {
    throw new Error('You can only confirm delivery for your own orders');
  }

  if (confirmed) {
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
    if (updateData.orderStatus === subOrderStatus.DELIVERED) {
      const mainOrderId = subOrder.main_order_id;

      if (mainOrderId) {
        // Sync main order status with sub-orders (includes COD payment status update)
        await module.exports.syncMainOrderStatusWithSubOrders(mainOrderId);
      }
    }

    return updatedSubOrder;
  } else {
    // Buyer says they did not receive the order
    const updateData = {
      delivery_status: deliveryStatus.DISPUTED,
      notes: 'Buyer disputed the order through email',
    };

    const updatedSubOrder = await repository.updateOne(
      SubOrderModel,
      { _id: subOrderId },
      updateData,
      { new: true }
    );

    // Notify admin about the dispute
    try {
      // Get admin users
      const adminUsers = await UserModel.find({ role: roles.admin })
        .select('email')
        .lean();

      if (adminUsers && adminUsers.length > 0) {
        const emailTemplate = generateAdminDisputeNotificationEmail(subOrder);

        // Send email to all admin users
        const emailPromises = adminUsers.map((admin) =>
          emailService
            .sendEmail({
              to: admin.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
            })
            .catch((error) => {
              console.error(
                `Error sending dispute email to admin ${admin.email}:`,
                error
              );
            })
        );

        await Promise.all(emailPromises);
      }
    } catch (error) {
      console.error('Error notifying admin about delivery dispute:', error);
      // TODO: Implement admin notification email
      // Don't fail the operation if email fails
    }

    return updatedSubOrder;
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
    .populate('products_list.product_id', 'name images price')
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