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

