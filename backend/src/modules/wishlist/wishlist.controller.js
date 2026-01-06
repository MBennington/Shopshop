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

