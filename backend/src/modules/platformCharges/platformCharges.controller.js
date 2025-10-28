const { platformCharges } = require('../../config/platform-charges.config');
const { successWithData, customError } = require('../../services/response.service');

/**
 * Get platform charges configuration
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getPlatformCharges = async (req, res) => {
  try {
    return successWithData(platformCharges, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};