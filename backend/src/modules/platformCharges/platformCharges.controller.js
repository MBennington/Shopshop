const { platformCharges } = require('../../config/platform-charges.config');
const { getConfiguredFees } = require('../../services/platform-charges.service');
const { successWithData, customError } = require('../../services/response.service');

/**
 * Get platform charges configuration
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getPlatformCharges = async (req, res) => {
  try {
    // Return full config and also buyer/seller fee lists for convenience
    const buyerFees = getConfiguredFees('buyer');
    const sellerFees = getConfiguredFees('seller');
    
    return successWithData({
      config: platformCharges,
      buyerFees,
      sellerFees,
    }, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};