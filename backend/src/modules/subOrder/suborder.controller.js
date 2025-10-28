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
 * Get sub-orders by seller ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getSubOrdersBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const data = await subOrderService.getSubOrdersBySeller(sellerId, req.query);
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
    const data = await subOrderService.confirmDelivery(id, req.body.delivery_confirmed);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};
