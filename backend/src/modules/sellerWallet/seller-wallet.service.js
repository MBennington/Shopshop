const SellerWalletModel = require('./seller-wallet.model');
const repository = require('../../services/repository.service');

/**
 * Get or create seller wallet
 * @param {String} seller_id
 * @returns {Promise<Object>}
 */
module.exports.getOrCreateWallet = async (seller_id) => {
  let wallet = await repository.findOne(SellerWalletModel, {
    seller_id: seller_id,
  });

  if (!wallet) {
    wallet = new SellerWalletModel({
      seller_id: seller_id,
      available_balance: 0,
      pending_balance: 0,
      total_earned: 0,
      total_withdrawn: 0,
      currency: 'LKR',
    });
    await repository.save(wallet);
  }

  return wallet;
};

/**
 * Get seller wallet
 * @param {String} seller_id
 * @returns {Promise<Object>}
 */
module.exports.getWallet = async (seller_id) => {
  const wallet = await repository.findOne(SellerWalletModel, {
    seller_id: seller_id,
  });

  if (!wallet) {
    throw new Error('Seller wallet not found');
  }

  return wallet;
};

/**
 * Add amount to pending balance (when payment is successful)
 * @param {String} seller_id
 * @param {Number} amount
 * @returns {Promise<Object>}
 */
module.exports.addToPendingBalance = async (seller_id, amount) => {
  const wallet = await this.getOrCreateWallet(seller_id);

  const updatedWallet = await repository.updateOne(
    SellerWalletModel,
    { seller_id: seller_id },
    {
      $inc: {
        pending_balance: amount,
      },
    },
    { new: true }
  );

  return updatedWallet;
};

/**
 * Move amount from pending to available balance (when delivery is confirmed)
 * @param {String} seller_id
 * @param {Number} amount
 * @returns {Promise<Object>}
 */
module.exports.movePendingToAvailable = async (seller_id, amount) => {
  const wallet = await this.getWallet(seller_id);

  if (wallet.pending_balance < amount) {
    throw new Error('Insufficient pending balance');
  }

  const updatedWallet = await repository.updateOne(
    SellerWalletModel,
    { seller_id: seller_id },
    {
      $inc: {
        pending_balance: -amount,
        available_balance: amount,
        total_earned: amount,
      },
    },
    { new: true }
  );

  return updatedWallet;
};

/**
 * Reserve amount from available balance (when payout is requested)
 * @param {String} seller_id
 * @param {Number} amount
 * @returns {Promise<Object>}
 */
module.exports.reserveFromAvailableBalance = async (seller_id, amount) => {
  const wallet = await this.getWallet(seller_id);

  if (wallet.available_balance < amount) {
    throw new Error('Insufficient available balance');
  }

  const updatedWallet = await repository.updateOne(
    SellerWalletModel,
    { seller_id: seller_id },
    {
      $inc: {
        available_balance: -amount,
      },
    },
    { new: true }
  );

  return updatedWallet;
};

/**
 * Return amount to available balance (when payout is rejected)
 * @param {String} seller_id
 * @param {Number} amount
 * @returns {Promise<Object>}
 */
module.exports.returnToAvailableBalance = async (seller_id, amount) => {
  const wallet = await this.getWallet(seller_id);

  const updatedWallet = await repository.updateOne(
    SellerWalletModel,
    { seller_id: seller_id },
    {
      $inc: {
        available_balance: amount,
      },
    },
    { new: true }
  );

  return updatedWallet;
};

/**
 * Complete payout (when payout is marked as paid)
 * @param {String} seller_id
 * @param {Number} amount
 * @returns {Promise<Object>}
 */
module.exports.completePayout = async (seller_id, amount) => {
  const wallet = await this.getWallet(seller_id);

  const updatedWallet = await repository.updateOne(
    SellerWalletModel,
    { seller_id: seller_id },
    {
      $inc: {
        total_withdrawn: amount,
      },
    },
    { new: true }
  );

  return updatedWallet;
};

