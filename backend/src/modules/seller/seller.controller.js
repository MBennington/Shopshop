const sellerService = require('./seller.service');
const {
  successWithData,
  customError,
} = require('../../services/response.service');

/**
 * Get analytics data for seller
 * @param {Object} req
 * @param {Object} res
 */
module.exports.getAnalytics = async (req, res) => {
  try {
    const sellerId = res.locals.user.id; // Get seller ID from authenticated user
    const { period, startDate, endDate } = req.query;
    const data = await sellerService.getAnalytics(sellerId, {
      period,
      startDate,
      endDate,
    });
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};
