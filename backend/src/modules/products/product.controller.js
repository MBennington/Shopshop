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

/**
 * Get products by seller
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getProductsBySeller = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const data = await productService.getProductsBySeller(user_id);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get product by ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getProductById = async (req, res) => {
  try {
    const product_id = req.params.id;
    const data = await productService.getProductById(product_id);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Update product
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.updateProduct = async (req, res) => {
  try {
    const product_id = req.params.id;
    const user_id = res.locals.user.id;
    const data = await productService.updateProduct(
      req.body,
      product_id,
      user_id
    );
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Soft delete product (change status to inactive)
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.deleteProduct = async (req, res) => {
  try {
    const product_id = req.params.id;
    const user_id = res.locals.user.id;
    await productService.deleteProduct(product_id, user_id);
    return successWithMessage('Product deactivated successfully', res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};
