const mongoose = require('mongoose');
const SubOrderModel = require('./suborder.model');
const OrderModel = require('../order/order.model');
const PaymentModel = require('../payment/payment.model');
const repository = require('../../services/repository.service');
const {
  subOrderStatus,
  sellerPaymentStatus,
  deliveryStatus,
} = require('../../config/suborder.config');

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
  const mainOrderIds = [...new Set(subOrders.map(so => so.main_order_id?._id || so.main_order_id))];
  const payments = await PaymentModel.find({
    order_id: { $in: mainOrderIds }
  }).lean();

  // Create a map of order_id to payment
  const paymentMap = {};
  payments.forEach(payment => {
    const orderId = payment.order_id?.toString() || payment.order_id;
    paymentMap[orderId] = payment;
  });

  // Transform the data to match expected structure
  const transformedSubOrders = subOrders.map((subOrder) => {
    const mainOrderId = subOrder.main_order_id?._id?.toString() || subOrder.main_order_id?.toString() || subOrder.main_order_id;
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
      payment_info: payment ? {
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        amount: payment.amount,
        payhere_payment_id: payment.payhere_payment_id,
        method: payment.method,
        status_message: payment.status_message,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
      } : null,
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
  return await repository.updateOne(
    SubOrderModel,
    { _id: subOrderId },
    statusData,
    { new: true }
  );
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
 * Get sub-order by ID
 * @param {String} subOrderId
 * @returns {Promise<Object>}
 */
module.exports.getSubOrderById = async (subOrderId) => {
  return await repository.findOne(SubOrderModel, { _id: subOrderId });
};
