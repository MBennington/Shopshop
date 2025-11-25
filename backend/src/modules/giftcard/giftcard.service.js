const GiftCardModel = require('./giftcard.model');
const repository = require('../../services/repository.service');
const { giftCardStatus, giftCardConfig } = require('../../config/giftcard.config');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Generate unique gift card code
 * Format: GC-XXXX-XXXX-XXXX (12 characters after prefix)
 */
const generateGiftCardCode = async () => {
  let code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate 12 random alphanumeric characters
    const randomPart = crypto.randomBytes(6).toString('hex').toUpperCase();
    // Format as GC-XXXX-XXXX-XXXX
    code = `${giftCardConfig.CODE_PREFIX}-${randomPart.slice(0, 4)}-${randomPart.slice(4, 8)}-${randomPart.slice(8, 12)}`;

    // Check if code already exists
    const existing = await GiftCardModel.findOne({ code });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique gift card code');
  }

  return code;
};

/**
 * Calculate expiry date (default: 1 year from now)
 */
const calculateExpiryDate = () => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + giftCardConfig.EXPIRY_DAYS);
  return expiryDate;
};

/**
 * Generate 4-digit PIN
 * @returns {String} 4-digit PIN (0000-9999)
 */
const generatePin = () => {
  // Generate random 4-digit PIN
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  return pin;
};

/**
 * Purchase a gift card
 * @param {Object} body - { amount, paymentMethod, recipientEmail? }
 * @param {String} user_id - User ID who purchased
 * @param {String} order_id - Order ID if purchased as part of order
 * @returns {Promise<Object>}
 */
module.exports.purchaseGiftCard = async (body, user_id, order_id = null) => {
  const { amount, recipientEmail } = body;

  // Validate amount
  if (amount < giftCardConfig.MIN_AMOUNT || amount > giftCardConfig.MAX_AMOUNT) {
    throw new Error(
      `Gift card amount must be between ${giftCardConfig.MIN_AMOUNT} and ${giftCardConfig.MAX_AMOUNT} LKR`
    );
  }

  // Generate unique code
  const code = await generateGiftCardCode();

  // Generate 4-digit PIN
  const pin = generatePin();

  // Calculate expiry date
  const expiryDate = calculateExpiryDate();

  // Create gift card (PIN will be hashed by pre-save hook)
  const giftCard = new GiftCardModel({
    code,
    pin, // Will be hashed automatically
    amount,
    remainingBalance: amount,
    purchasedBy: user_id,
    expiryDate,
    status: giftCardStatus.ACTIVE,
    purchaseOrderId: order_id,
    emailRecipient: recipientEmail || null,
  });

  await repository.save(giftCard);

  // Return gift card with plain PIN (only shown once during purchase)
  const giftCardObj = giftCard.toObject();
  // Remove hashed PIN from response
  delete giftCardObj.pin;
  
  // Return gift card with plain PIN (shown only once)
  return {
    ...giftCardObj,
    pin: pin, // Return plain PIN only once during purchase
  };
};

/**
 * Validate and redeem gift card
 * @param {String} code - Gift card code
 * @param {String} pin - 4-digit PIN
 * @param {String} user_id - User ID redeeming
 * @returns {Promise<Object>}
 */
module.exports.validateGiftCard = async (code, pin, user_id) => {
  const giftCard = await GiftCardModel.findOne({ code: code.toUpperCase() });

  if (!giftCard) {
    throw new Error('Invalid gift card code');
  }

  // Verify PIN
  const isPinValid = await giftCard.verifyPin(pin);
  if (!isPinValid) {
    throw new Error('Invalid PIN');
  }

  // Check if expired
  if (new Date() > giftCard.expiryDate) {
    // Update status if expired
    if (giftCard.status === giftCardStatus.ACTIVE) {
      await repository.updateOne(
        GiftCardModel,
        { _id: giftCard._id },
        { status: giftCardStatus.EXPIRED },
        { new: true }
      );
    }
    throw new Error('Gift card has expired');
  }

  // Check status
  if (giftCard.status !== giftCardStatus.ACTIVE) {
    throw new Error(`Gift card is ${giftCard.status}`);
  }

  // Check remaining balance
  if (giftCard.remainingBalance <= 0) {
    throw new Error('Gift card has no remaining balance');
  }

  // Set redeemedBy if not already set
  if (!giftCard.redeemedBy) {
    await repository.updateOne(
      GiftCardModel,
      { _id: giftCard._id },
      { redeemedBy: user_id },
      { new: true }
    );
  }

  const giftCardObj = giftCard.toObject();
  delete giftCardObj.pin; // Never return PIN in response
  return giftCardObj;
};

/**
 * Apply gift card to order
 * @param {String} code - Gift card code
 * @param {Number} orderTotal - Total order amount
 * @param {String} user_id - User ID
 * @param {String} order_id - Order ID
 * @returns {Promise<Object>} - { appliedAmount, remainingBalance, giftCard }
 */
module.exports.applyGiftCardToOrder = async (code, pin, orderTotal, user_id, order_id) => {
  const giftCard = await this.validateGiftCard(code, pin, user_id);

  const appliedAmount = Math.min(giftCard.remainingBalance, orderTotal);
  const newRemainingBalance = giftCard.remainingBalance - appliedAmount;

  // Determine new status
  let newStatus = giftCard.status;
  if (newRemainingBalance <= 0) {
    newStatus = giftCardStatus.FULLY_REDEEMED;
  }

  // Update gift card
  const updatedGiftCard = await repository.updateOne(
    GiftCardModel,
    { _id: giftCard._id },
    {
      remainingBalance: newRemainingBalance,
      status: newStatus,
      $push: {
        redemptionHistory: {
          orderId: order_id,
          amountUsed: appliedAmount,
          remainingBalance: newRemainingBalance,
          redeemedAt: new Date(),
        },
      },
    },
    { new: true }
  );

  return {
    appliedAmount,
    remainingBalance: newRemainingBalance,
    giftCard: updatedGiftCard.toObject(),
  };
};

/**
 * Get user's active gift cards
 * @param {String} user_id - User ID
 * @returns {Promise<Array>}
 */
module.exports.getUserGiftCards = async (user_id) => {
  const giftCards = await GiftCardModel.find({
    $or: [
      { purchasedBy: user_id },
      { redeemedBy: user_id },
    ],
    status: { $in: [giftCardStatus.ACTIVE, giftCardStatus.FULLY_REDEEMED, giftCardStatus.EXPIRED] },
  })
    .sort({ created_at: -1 })
    .lean();

  // Filter out expired cards that haven't been updated yet and remove PINs
  const now = new Date();
  return giftCards.map((card) => {
    const isExpired = now > new Date(card.expiryDate);
    const cardObj = {
      ...card,
      isExpired,
      status: isExpired && card.status === giftCardStatus.ACTIVE 
        ? giftCardStatus.EXPIRED 
        : card.status,
    };
    delete cardObj.pin; // Never return PIN
    return cardObj;
  });
};

/**
 * Get gift card by code (for validation)
 * @param {String} code - Gift card code
 * @returns {Promise<Object>}
 */
module.exports.getGiftCardByCode = async (code) => {
  const giftCard = await GiftCardModel.findOne({ code: code.toUpperCase() });
  return giftCard ? giftCard.toObject() : null;
};

/**
 * Refund gift card balance (for order cancellation)
 * @param {String} code - Gift card code
 * @param {Number} refundAmount - Amount to refund
 * @returns {Promise<Object>}
 */
module.exports.refundGiftCard = async (code, refundAmount) => {
  const giftCard = await GiftCardModel.findOne({ code: code.toUpperCase() });

  if (!giftCard) {
    throw new Error('Gift card not found');
  }

  // Only refund if card was fully redeemed or has remaining balance
  if (giftCard.status === giftCardStatus.FULLY_REDEEMED) {
    // Reactivate card and add refund amount
    const newBalance = refundAmount;
    await repository.updateOne(
      GiftCardModel,
      { _id: giftCard._id },
      {
        remainingBalance: newBalance,
        status: giftCardStatus.ACTIVE,
      },
      { new: true }
    );
  } else if (giftCard.status === giftCardStatus.ACTIVE) {
    // Add to existing balance
    const newBalance = giftCard.remainingBalance + refundAmount;
    await repository.updateOne(
      GiftCardModel,
      { _id: giftCard._id },
      {
        remainingBalance: newBalance,
      },
      { new: true }
    );
  }

  return await GiftCardModel.findById(giftCard._id).lean();
};

