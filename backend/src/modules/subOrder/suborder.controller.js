const subOrderService = require('./suborder.service');
const {
  successWithData,
  customError,
} = require('../../services/response.service');

/**
 * Get sub-orders by main order ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getSubOrdersByMainOrder = async (req, res) => {
  try {
    const { mainOrderId } = req.params;
    const data = await subOrderService.getSubOrdersByMainOrder(mainOrderId);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get distinct customers (buyers) for a seller
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getSellerCustomers = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const userId = res.locals.user?.id;
    if (userId !== sellerId && res.locals.user?.role !== 'admin') {
      return res.status(403).json({ status: false, msg: 'Forbidden' });
    }
    const data = await subOrderService.getSellerCustomers(sellerId, req.query);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get sub-orders by seller ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getSubOrdersBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const data = await subOrderService.getSubOrdersBySeller(
      sellerId,
      req.query
    );
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get sub-order by ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getSubOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await subOrderService.getSubOrderById(id);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Update sub-order status
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.updateSubOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await subOrderService.updateSubOrderStatus(id, req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Update tracking number
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.updateTrackingNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await subOrderService.updateSubOrderStatus(id, req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Confirm delivery
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.confirmDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await subOrderService.confirmDelivery(
      id,
      req.body.delivery_confirmed
    );
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Buyer confirms or disputes delivery
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.buyerConfirmDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmed } = req.body;
    const user_id = res.locals.user.id;

    const data = await subOrderService.buyerConfirmDelivery(
      id,
      confirmed,
      user_id
    );
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Check if user has suborders for a product (for review eligibility)
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.checkReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = res.locals.user.id;
    const { subOrderStatus } = require('../../config/suborder.config');

    const subOrders = await subOrderService.getUserSubOrdersForProduct(userId, productId);

    if (!subOrders || subOrders.length === 0) {
      return successWithData({
        eligible: false,
        hasSubOrders: false,
        message: 'You must have purchased this product to leave a review.',
      }, res);
    }

    // Check order statuses
    const allDelivered = subOrders.every(so => so.orderStatus === subOrderStatus.DELIVERED);
    const nonDeliveredSubOrders = subOrders.filter(so => so.orderStatus !== subOrderStatus.DELIVERED);

    return successWithData({
      eligible: true,
      hasSubOrders: true,
      allDelivered,
      nonDeliveredSubOrderIds: nonDeliveredSubOrders.map(so => so._id.toString()),
      subOrders: subOrders.map(so => ({
        _id: so._id.toString(),
        orderStatus: so.orderStatus,
      })),
    }, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};