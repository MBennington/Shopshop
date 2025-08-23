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
