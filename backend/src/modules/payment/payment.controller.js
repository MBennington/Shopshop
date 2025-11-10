const paymentService = require('./payment.service');
const {
  successWithData,
  successWithMessage,
  customError,
} = require('../../services/response.service');

/**
 * Update payment status
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.updatePaymentStatus = async (req, res) => {
  try {
    console.log('payment data: ', req.body);
    const data = await paymentService.updatePaymentStatus(req.body);

    return successWithData(data, res);
  } catch (error) {
    console.error('Error updating payment status:', error);
    return customError(`${error.message}`, res);
  }
};
