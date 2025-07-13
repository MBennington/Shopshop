const productService = require('./product.service');
const {
  successWithData,
  successWithMessage,
  customError,
} = require('../../services/response.service');

/**
 * Add a product
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.createProduct = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const data = await productService.createProduct(req.body, user_id);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};
