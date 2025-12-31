const PayoutModel = require('./payout.model');
const repository = require('../../services/repository.service');
const sellerWalletService = require('../sellerWallet/seller-wallet.service');
const userService = require('../users/user.service');
const { roles } = require('../../config/role.config');

/**
 * Create payout request
 * @param {String} seller_id
 * @param {Number} amount_requested
 * @param {String} method
 * @returns {Promise<Object>}
 */
module.exports.createPayoutRequest = async (
  seller_id,
  amount_requested,
  method = 'BANK_TRANSFER'
) => {
  // Get seller wallet to check available balance
  const wallet = await sellerWalletService.getWallet(seller_id);

  if (wallet.available_balance < amount_requested) {
    throw new Error('Insufficient available balance');
  }

  if (amount_requested <= 0) {
    throw new Error('Payout amount must be greater than 0');
  }

  // Get seller info for bank details
  const seller = await userService.getUserById(seller_id);
  if (!seller || !seller.sellerInfo) {
    throw new Error('Seller information not found');
  }

  const payoutData = {
    seller_id: seller_id,
    amount_requested: amount_requested,
    amount_paid: 0,
    currency: wallet.currency || 'LKR',
    status: 'PENDING',
    method: method,
    bank_name: seller.sellerInfo.payouts?.paymentMethod || null,
    bank_account_number: seller.sellerInfo.payouts?.accountNumber || null,
    bank_account_name: seller.name || null, // Use seller's name as account name
    requested_at: new Date(),
  };

  const newPayout = new PayoutModel(payoutData);
  await repository.save(newPayout);

  // Reserve the amount from available balance
  await sellerWalletService.reserveFromAvailableBalance(
    seller_id,
    amount_requested
  );

  return newPayout.toObject();
};

/**
 * Get payout by ID
 * @param {String} payout_id
 * @returns {Promise<Object>}
 */
module.exports.getPayoutById = async (payout_id, role, user_id) => {
  const payout = await repository
    .findOne(PayoutModel, { _id: payout_id })
    .populate(
      'seller_id',
      'name email sellerInfo.businessName sellerInfo.payouts'
    );

  if (!payout) {
    throw new Error('Payout not found');
  }

  if (
    role !== roles.admin &&
    payout.seller_id.toString() !== user_id.toString()
  ) {
    throw new Error('You are not authorized to view this payout');
  }

  return payout;
};

/**
 * Get payouts by seller ID
 * @param {String} seller_id
 * @param {Object} options - { page, limit, status }
 * @returns {Promise<Object>}
 */
module.exports.getPayoutsBySeller = async (seller_id, options = {}) => {
  const { page = 1, limit = 10, status } = options;
  const skip = (page - 1) * limit;

  const query = { seller_id: seller_id };
  if (status) {
    query.status = status;
  }

  const payouts = await repository.findMany(PayoutModel, query, {
    skip,
    limit,
    sort: { created_at: -1 },
  });

  const total = await repository.count(PayoutModel, query);

  return {
    payouts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get all payouts (admin)
 * @param {Object} options - { page, limit, status, seller_id }
 * @returns {Promise<Object>}
 */
module.exports.getAllPayouts = async (options = {}) => {
  const { page = 1, limit = 10, status, seller_id } = options;
  const skip = (page - 1) * limit;

  const query = {};
  if (status) {
    query.status = status;
  }
  if (seller_id) {
    query.seller_id = seller_id;
  }

  const payouts = await repository
    .findMany(PayoutModel, query, {
      skip,
      limit,
      sort: { created_at: -1 },
    })
    .populate('seller_id', 'name email sellerInfo.businessName');

  const total = await repository.count(PayoutModel, query);

  return {
    payouts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Approve payout request (admin)
 * @param {String} payout_id
 * @param {String} admin_note
 * @returns {Promise<Object>}
 */
module.exports.approvePayout = async (payout_id, admin_note = null) => {
  const payout = await this.getPayoutById(payout_id);

  if (payout.status !== 'PENDING') {
    throw new Error(`Cannot approve payout with status ${payout.status}`);
  }

  const updatedPayout = await repository.updateOne(
    PayoutModel,
    { _id: payout_id },
    {
      status: 'APPROVED',
      approved_at: new Date(),
      admin_note: admin_note || payout.admin_note,
    },
    { new: true }
  );

  return updatedPayout;
};

/**
 * Reject payout request (admin)
 * @param {String} payout_id
 * @param {String} admin_note
 * @returns {Promise<Object>}
 */
module.exports.rejectPayout = async (payout_id, admin_note) => {
  const payout = await this.getPayoutById(payout_id);

  if (payout.status !== 'PENDING') {
    throw new Error(`Cannot reject payout with status ${payout.status}`);
  }

  // Return the amount to available balance
  await sellerWalletService.returnToAvailableBalance(
    payout.seller_id.toString(),
    payout.amount_requested
  );

  const updatedPayout = await repository.updateOne(
    PayoutModel,
    { _id: payout_id },
    {
      status: 'REJECTED',
      admin_note: admin_note,
    },
    { new: true }
  );

  return updatedPayout;
};

/**
 * Mark payout as paid (admin)
 * @param {String} payout_id
 * @param {Number} amount_paid
 * @param {Array<String>} receipt_urls
 * @param {String} admin_note
 * @returns {Promise<Object>}
 */
module.exports.markPayoutAsPaid = async (
  payout_id,
  amount_paid,
  receipt_urls = [],
  admin_note = null
) => {
  const payout = await this.getPayoutById(payout_id);

  if (payout.status !== 'APPROVED') {
    throw new Error(
      `Cannot mark payout as paid. Current status: ${payout.status}`
    );
  }

  // Complete the payout (update total_withdrawn)
  await sellerWalletService.completePayout(
    payout.seller_id.toString(),
    amount_paid || payout.amount_requested
  );

  const updatedPayout = await repository.updateOne(
    PayoutModel,
    { _id: payout_id },
    {
      status: 'PAID',
      amount_paid: amount_paid || payout.amount_requested,
      receipt_urls: receipt_urls,
      paid_at: new Date(),
      admin_note: admin_note || payout.admin_note,
    },
    { new: true }
  );

  return updatedPayout;
};

/**
 * Cancel payout request (seller can cancel if still pending)
 * @param {String} payout_id
 * @param {String} seller_id
 * @returns {Promise<Object>}
 */
module.exports.cancelPayout = async (payout_id, seller_id) => {
  const payout = await this.getPayoutById(payout_id);

  if (payout.seller_id.toString() !== seller_id) {
    throw new Error('You can only cancel your own payout requests');
  }

  if (payout.status !== 'PENDING') {
    throw new Error(`Cannot cancel payout with status ${payout.status}`);
  }

  // Return the amount to available balance
  await sellerWalletService.returnToAvailableBalance(
    seller_id,
    payout.amount_requested
  );

  const updatedPayout = await repository.updateOne(
    PayoutModel,
    { _id: payout_id },
    {
      status: 'REJECTED',
      admin_note: 'Cancelled by seller',
    },
    { new: true }
  );

  return updatedPayout;
};
