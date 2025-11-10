const mongoose = require('mongoose');
const SubOrderModel = require('./suborder.model');
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

  const filter = { seller_id: sellerId };
  if (status) {
    filter.orderStatus = status;
  }

  const skip = (page - 1) * limit;

  return await repository.findMany(SubOrderModel, filter, null, {
    skip,
    limit: parseInt(limit),
  });
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
