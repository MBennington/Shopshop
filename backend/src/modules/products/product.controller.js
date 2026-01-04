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

    const data = await productService.createProduct(
      req.body,
      req.files,
      user_id
    );

    return successWithData(data, res);
  } catch (error) {
    console.error('Create product error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Get products by seller (authenticated - seller's own products, includes inactive)
 * GET /api/products/products-by-seller?search=...&category=...&page=1&limit=20
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getProductsBySeller = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const query = {
      ...req.query,
      seller: user_id,
      includeInactive: true, // Sellers can see their inactive products
    };
    const data = await productService.getProducts(query);
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

    // Get existing product for image merging
    const existingProduct = await productService.getProductById(product_id);

    // Process form data with images, merging with existing images
    const processedData = await productService.processProductData(
      req.body,
      req.files,
      existingProduct
    );
    const data = await productService.updateProduct(
      processedData,
      product_id,
      user_id
    );

    return successWithData(data, res);
  } catch (error) {
    console.error('Update product error:', error);
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

/**
 * Get products
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getProducts = async (req, res) => {
  try {
    const data = await productService.getProducts(req.query);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error}`, res);
  }
};

/**
 * Get product details with seller info and review summary
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const data = await productService.getProductDetails(productId);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get products by seller ID (public shop pages - active only)
 * GET /api/products/products-by-seller-id/:id?search=...&category=...&page=1&limit=20
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getProductsBySellerId = async (req, res) => {
  try {
    const sellerId = req.params.id;
    const query = {
      ...req.query,
      seller: sellerId,
      includeInactive: false, // Public pages only show active
    };
    const data = await productService.getProducts(query);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};
