const adminService = require('./admin.service');
const {
  successWithData,
  customError,
} = require('../../services/response.service');

/**
 * Get admin dashboard statistics
 * @param {Object} req
 * @param {Object} res
 */
module.exports.getDashboardStats = async (req, res) => {
  try {
    const data = await adminService.getDashboardStats();
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get all products for admin with filters
 * @param {Object} req
 * @param {Object} res
 */
module.exports.getAllProductsForAdmin = async (req, res) => {
  try {
    const { category, sellerId, page, limit, search } = req.query;
    const data = await adminService.getAllProductsForAdmin({
      category,
      sellerId,
      page,
      limit,
      search,
    });
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Deactivate product (admin only)
 * @param {Object} req
 * @param {Object} res
 */
module.exports.deactivateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await adminService.deactivateProduct(id);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Activate product (admin only)
 * @param {Object} req
 * @param {Object} res
 */
module.exports.activateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await adminService.activateProduct(id);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get product stock data (admin only)
 * @param {Object} req
 * @param {Object} res
 */
module.exports.getProductStockData = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await adminService.getProductStockData(id);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};


