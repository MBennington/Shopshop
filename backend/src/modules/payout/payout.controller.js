const payoutService = require('./payout.service');
const {
  successWithData,
  customError,
} = require('../../services/response.service');

/**
 * Create payout request
 * @param {Object} req
 * @param {Object} res
 */
module.exports.createPayoutRequest = async (req, res) => {
  try {
    const seller_id = res.locals.user.id.toString();
    const { amount_requested, method } = req.body;
    const data = await payoutService.createPayoutRequest(
      seller_id,
      amount_requested,
      method
    );
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get payouts by seller
 * @param {Object} req
 * @param {Object} res
 */
module.exports.getPayoutsBySeller = async (req, res) => {
  try {
    const seller_id = res.locals.user.id.toString();
    const { page, limit, status } = req.query;
    const data = await payoutService.getPayoutsBySeller(seller_id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
    });
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get payout by ID
 * @param {Object} req
 * @param {Object} res
 */
module.exports.getPayoutById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = res.locals.user.role;
    const user_id = res.locals.user.id;
    const data = await payoutService.getPayoutById(id, role, user_id);

    return successWithData(data, res);
  } catch (error) {
    return handleError(res, error.message, 400);
  }
};

/**
 * Get all payouts (admin)
 * @param {Object} req
 * @param {Object} res
 */
module.exports.getAllPayouts = async (req, res) => {
  try {
    const { page, limit, status, seller_id } = req.query;
    const data = await payoutService.getAllPayouts({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      seller_id,
    });
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Approve payout (admin)
 * @param {Object} req
 * @param {Object} res
 */
module.exports.approvePayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;
    const data = await payoutService.approvePayout(id, admin_note);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Reject payout (admin)
 * @param {Object} req
 * @param {Object} res
 */
module.exports.rejectPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;
    const data = await payoutService.rejectPayout(id, admin_note);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Mark payout as paid (admin)
 * @param {Object} req
 * @param {Object} res
 */
module.exports.markPayoutAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount_paid, receipt_urls, admin_note } = req.body;
    const data = await payoutService.markPayoutAsPaid(
      id,
      amount_paid,
      receipt_urls,
      admin_note
    );
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Cancel payout (seller)
 * @param {Object} req
 * @param {Object} res
 */
module.exports.cancelPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = res.locals.user.role;
    const seller_id = res.locals.user.id;
    const data = await payoutService.cancelPayout(id, role, seller_id);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};
