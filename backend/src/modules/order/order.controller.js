const orderService = require('./order.service');
const {
  successWithData,
  successWithMessage,
  customError,
} = require('../../services/response.service');

/**
 * Create order
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.createOrder = async (req, res) => {
  try {
    const user_id = res.locals.user.id;

    const data = await orderService.createOrder(user_id, req.body);

    return successWithData(data, res);
  } catch (error) {
    console.error('Creating order error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Get order by ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.findOrderById = async (req, res) => {
  try {
    const order_id = req.query.order_id;
    const data = await orderService.findOrderById(order_id);

    return successWithData(data, res);
  } catch (error) {
    console.error('Finding order error:', error);
    return customError(`${error.message}`, res);
  }
};
