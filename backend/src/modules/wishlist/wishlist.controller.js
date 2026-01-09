const wishlistService = require('./wishlist.service');
const {
  successWithData,
  successWithMessage,
  customError,
} = require('../../services/response.service');

/**
 * Add product to wishlist
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.addToWishlist = async (req, res) => {
  try {
    const user_id = res.locals.user.id;

    const data = await wishlistService.addToWishlist(req.body, user_id);

    return successWithData(data, res);
  } catch (error) {
    console.error('Adding to wishlist error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Get wishlist by user_id
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getWishlistByUserId = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const data = await wishlistService.getWishlistByUserId(user_id);
    return successWithData(data, res);
  } catch (error) {
    console.error('Getting wishlist error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Remove product from wishlist
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.removeFromWishlist = async (req, res) => {
  try {
    const user_id = res.locals.user.id;

    const data = await wishlistService.removeFromWishlist(req.query, user_id);

    return successWithMessage('Product removed from wishlist successfully.', res);
  } catch (error) {
    console.error('Removing from wishlist error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Add wishlist item to cart
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.addWishlistItemToCart = async (req, res) => {
  try {
    const user_id = res.locals.user.id;

    const data = await wishlistService.addWishlistItemToCart(req.body, user_id);

    return successWithData(data, res);
  } catch (error) {
    console.error('Adding wishlist item to cart error:', error);
    return customError(`${error.message}`, res);
  }
};
