const sellerWalletService = require('./seller-wallet.service');
const {
  successWithData,
  customError,
} = require('../../services/response.service');

/**
 * Get seller wallet
 * @param {Object} req
 * @param {Object} res
 */
module.exports.getWallet = async (req, res) => {
  try {
    const seller_id = res.locals.user.id.toString();
    const data = await sellerWalletService.getWallet(seller_id);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get seller wallet by seller ID (admin)
 * @param {Object} req
 * @param {Object} res
 */
module.exports.getWalletBySellerId = async (req, res) => {
  try {
    const { seller_id } = req.params;
    const data = await sellerWalletService.getWallet(seller_id);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};


