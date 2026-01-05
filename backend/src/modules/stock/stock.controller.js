const stockService = require('./stock.service');
const {
  successWithData,
  successWithMessage,
  customError,
} = require('../../services/response.service');

/**
 * Get stock by product ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getStockByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const data = await stockService.getStockByProduct(product_id);
    return successWithData(data, res);
  } catch (error) {
    console.error('Get stock by product error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Get stock records by seller
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getStockBySeller = async (req, res) => {
  try {
    const seller_id = req.query.seller_id || res.locals.user.id;
    const queryParams = {
      seller_id,
      page: req.query.page,
      limit: req.query.limit,
    };
    const data = await stockService.getStockBySeller(seller_id, queryParams);
    return successWithData(data, res);
  } catch (error) {
    console.error('Get stock by seller error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Increment sales count and earnings
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.incrementSales = async (req, res) => {
  try {
    const { product_id, colorCode, size, quantity, price } = req.body;
    const data = await stockService.incrementSales(
      product_id,
      colorCode,
      size,
      quantity,
      price
    );
    return successWithData(data, res);
  } catch (error) {
    console.error('Increment sales error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Update stock record
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.updateStock = async (req, res) => {
  try {
    const { product_id } = req.params;
    const data = await stockService.updateStock(product_id, req.body);
    return successWithData(data, res);
  } catch (error) {
    console.error('Update stock error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Get all stock records (admin only)
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getAllStocks = async (req, res) => {
  try {
    const queryParams = {
      page: req.query.page,
      limit: req.query.limit,
      seller_id: req.query.seller_id,
      sortBy: req.query.sortBy,
    };
    const data = await stockService.getAllStocks(queryParams);
    return successWithData(data, res);
  } catch (error) {
    console.error('Get all stocks error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Create or get stock record for a product
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.createOrGetStock = async (req, res) => {
  try {
    const { product_id } = req.body;
    const seller_id = res.locals.user.id;
    const data = await stockService.createOrGetStock(product_id, seller_id);
    return successWithData(data, res);
  } catch (error) {
    console.error('Create or get stock error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Restock a product variant
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.restockProduct = async (req, res) => {
  try {
    const { product_id, colorCode, size, quantity, notes } = req.body;
    const data = await stockService.restockProduct(
      product_id,
      colorCode,
      size,
      quantity,
      notes
    );
    return successWithData(data, res);
  } catch (error) {
    console.error('Restock product error:', error);
    return customError(`${error.message}`, res);
  }
};

