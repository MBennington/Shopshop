const cartService = require('./cart.service');
const {
  successWithData,
  successWithMessage,
  customError,
} = require('../../services/response.service');

/**
 * Add or Update Cart
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.createOrUpdateCart = async (req, res) => {
  try {
    const user_id = res.locals.user.id;

    const data = await cartService.createOrUpdateCart(req.body, user_id);

    return successWithData(data, res);
  } catch (error) {
    // console.error('Updating cart error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Get cart by user_id
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getCartByUserId = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const data = await cartService.getCartByUserId(user_id);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Remove from Cart
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.removeFromCart = async (req, res) => {
  try {
    const user_id = res.locals.user.id;

    const data = await cartService.removeFromCart(user_id, req.query);

    return successWithData(data, res);
  } catch (error) {
    // console.error('Updating cart error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Update quantity
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.updateQuantity = async (req, res) => {
  try {
    const user_id = res.locals.user.id;

    const data = await cartService.updateQuantity(req.body, user_id);

    return successWithData(data, res);
  } catch (error) {
    // console.error('Updating cart error:', error);
    return customError(`${error.message}`, res);
  }
};
