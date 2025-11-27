const GiftCardModel = require('./giftcard.model');
const GiftCardPaymentModel = require('./giftcard-payment.model');
const repository = require('../../services/repository.service');
const {
  giftCardStatus,
  giftCardConfig,
} = require('../../config/giftcard.config');
const { paymentStatus } = require('../../config/order.config');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const md5 = require('md5');

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
    code = `${giftCardConfig.CODE_PREFIX}-${randomPart.slice(
      0,
      4
    )}-${randomPart.slice(4, 8)}-${randomPart.slice(8, 12)}`;

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
  if (
    amount < giftCardConfig.MIN_AMOUNT ||
    amount > giftCardConfig.MAX_AMOUNT
  ) {
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

  // Ensure PIN is a string and trim whitespace
  const pinString = String(pin).trim();

  // Verify PIN
  const isPinValid = await giftCard.verifyPin(pinString);
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
module.exports.applyGiftCardToOrder = async (
  code,
  pin,
  orderTotal,
  user_id,
  order_id
) => {
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
    $or: [{ purchasedBy: user_id }, { redeemedBy: user_id }],
    status: {
      $in: [
        giftCardStatus.ACTIVE,
        giftCardStatus.FULLY_REDEEMED,
        giftCardStatus.EXPIRED,
      ],
    },
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
      status:
        isExpired && card.status === giftCardStatus.ACTIVE
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

/**
 * Generate unique payment ID for gift card purchase
 * Format: GC-{timestamp}-{random}
 */
const generateGiftCardPaymentId = () => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `GC-${timestamp}-${random}`;
};

/**
 * Generate PayHere hash for gift card payment
 * @param {String} paymentId - Payment ID
 * @param {Number} amount - Payment amount
 * @param {String} currency - Currency (default: LKR)
 * @returns {Promise<String>}
 */
module.exports.generatePayHereHash = async (
  paymentId,
  amount,
  currency = 'LKR'
) => {
  const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
  const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;

  const hashedSecret = md5(MERCHANT_SECRET).toString().toUpperCase();
  const amountFormatted = parseFloat(amount)
    .toLocaleString('en-US', { minimumFractionDigits: 2 })
    .replaceAll(',', '');
  const hash = md5(
    MERCHANT_ID + paymentId + amountFormatted + currency + hashedSecret
  )
    .toString()
    .toUpperCase();

  return hash;
};

/**
 * Initiate gift card purchase payment
 * Creates payment record and returns PayHere payment data
 * @param {Object} body - { amount, recipientEmail? }
 * @param {String} user_id - User ID
 * @returns {Promise<Object>} PayHere payment data
 */
module.exports.initiateGiftCardPurchase = async (body, user_id) => {
  const { amount, recipientEmail } = body;

  // Validate amount
  if (
    amount < giftCardConfig.MIN_AMOUNT ||
    amount > giftCardConfig.MAX_AMOUNT
  ) {
    throw new Error(
      `Gift card amount must be between ${giftCardConfig.MIN_AMOUNT} and ${giftCardConfig.MAX_AMOUNT} LKR`
    );
  }

  // Generate unique payment ID
  const paymentId = generateGiftCardPaymentId();

  // Create payment record (gift card will be created after payment success)
  const payment = new GiftCardPaymentModel({
    user_id,
    payment_id: paymentId,
    amount,
    currency: 'LKR',
    paymentStatus: paymentStatus.PENDING,
    purchaseDetails: {
      amount,
      recipientEmail: recipientEmail || null,
    },
  });

  await repository.save(payment);

  // Generate PayHere hash
  const hash = await this.generatePayHereHash(paymentId, amount, 'LKR');

  // Return PayHere payment data
  return {
    merchantId: process.env.PAYHERE_MERCHANT_ID,
    user_id: user_id,
    paymentId: paymentId,
    amount,
    currency: 'LKR',
    hash,
  };
};

/**
 * Create gift card after successful payment
 * @param {String} payment_id - Payment ID
 * @returns {Promise<Object>} Gift card with plain PIN
 */
module.exports.createGiftCardAfterPayment = async (payment_id) => {
  // Find payment record using repository service
  const payment = await repository.findOne(GiftCardPaymentModel, {
    payment_id: payment_id,
  });

  if (!payment) {
    throw new Error('Payment record not found');
  }

  // Check if gift card already created (idempotency)
  if (payment.gift_card_id) {
    const existingGiftCard = await repository.findOne(GiftCardModel, {
      _id: payment.gift_card_id,
    });
    if (existingGiftCard) {
      // Return existing gift card (but we need to get the PIN from somewhere)
      // Since PIN is hashed, we can't return it again
      // This should not happen in normal flow, but handle gracefully
      throw new Error('Gift card already created for this payment');
    }
  }

  const { amount, recipientEmail } = payment.purchaseDetails;

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
    purchasedBy: payment.user_id,
    expiryDate,
    status: giftCardStatus.ACTIVE,
    purchaseOrderId: null, // Not purchased as part of order
    emailRecipient: recipientEmail || null,
  });

  await repository.save(giftCard);

  // Update payment record with gift card ID and temporary PIN
  await repository.updateOne(
    GiftCardPaymentModel,
    { _id: payment._id },
    {
      gift_card_id: giftCard._id,
      temporaryPin: pin, // Store PIN temporarily for retrieval
    },
    { new: true }
  );

  // Return gift card with plain PIN (only shown once)
  const giftCardObj = giftCard.toObject();
  delete giftCardObj.pin; // Remove hashed PIN

  return {
    ...giftCardObj,
    pin: pin, // Return plain PIN only once
  };
};

/**
 * Update gift card payment status
 * Called from webhook after PayHere payment
 * @param {Object} data - { payment_id, payment_id (PayHere), status_code, status_message, method }
 * @returns {Promise<Object>} Updated payment and gift card (if created)
 */
module.exports.updateGiftCardPaymentStatus = async (data) => {
  // PayHere sends order_id as the GC value (our payment_id)
  // payment_id in the payload is PayHere's payment ID
  const { payment_id, order_id, status_code, status_message, method } = data;

  // console.log('=== updateGiftCardPaymentStatus Service ===');
  // console.log('Input data:', {
  //   payment_id,
  //   payhere_payment_id,
  //   status_code,
  //   status_message,
  //   method,
  // });
  // console.log('Status code type:', typeof status_code, 'Value:', status_code);

  // Find payment record
  const payment = await repository.findOne(GiftCardPaymentModel, {
    payment_id: order_id,
  });

  if (!payment) {
    //console.error('Payment record not found for payment_id:', payment_id);
    throw new Error(`Payment record not found for payment_id: ${payment_id}`);
  }

  // console.log('Found payment record:', {
  //   _id: payment._id,
  //   payment_id: payment.payment_id,
  //   current_status: payment.paymentStatus,
  //   amount: payment.amount,
  // });

  // Check if payment is successful (status_code = 2)
  // PayHere sends status_code as string, but handle both string and number
  const isSuccess = status_code == 2 || status_code === '2';
  // console.log(
  //   'Is payment successful?',
  //   isSuccess,
  //   '(status_code:',
  //   status_code,
  //   ')'
  // );

  if (isSuccess) {
    // Update payment status
    const updatedPayment = await repository.updateOne(
      GiftCardPaymentModel,
      { _id: payment._id },
      {
        paymentStatus: paymentStatus.PAID,
        payhere_payment_id: payment_id,
        method: method,
        status_message: status_message,
      },
      { new: true }
    );

    // Payment successful
    let giftCard = null;

    // Create gift card if not already created
    if (!payment.gift_card_id) {
      try {
        giftCard = await this.createGiftCardAfterPayment(order_id);
      } catch (error) {
        // If gift card already exists error, fetch it
        if (error.message.includes('already created')) {
          const updatedPayment = await repository.findOne(
            GiftCardPaymentModel,
            { payment_id: order_id }
          );
          if (updatedPayment?.gift_card_id) {
            const existingGiftCard = await repository.findOne(GiftCardModel, {
              _id: updatedPayment.gift_card_id,
            });
            if (existingGiftCard) {
              giftCard = existingGiftCard.toObject();
              delete giftCard.pin;
              // Include temporary PIN if available
              if (updatedPayment.temporaryPin) {
                giftCard.pin = updatedPayment.temporaryPin;
              }
            }
          }
        } else {
          //console.error('Error creating gift card after payment:', error);
          throw error;
        }
      }
    } else {
      // Gift card already exists, fetch it with temporary PIN from payment
      const updatedPayment = await repository.findOne(GiftCardPaymentModel, {
        _id: payment._id,
      });
      const existingGiftCard = await repository.findOne(GiftCardModel, {
        _id: payment.gift_card_id,
      });
      if (existingGiftCard) {
        giftCard = existingGiftCard.toObject();
        delete giftCard.pin;
        // Include temporary PIN if available
        if (updatedPayment.temporaryPin) {
          giftCard.pin = updatedPayment.temporaryPin;
        }
      }
    }

    return {
      payment: updatedPayment.toObject(),
      giftCard: giftCard,
    };
  } else {
    // Payment failed
    const updatedPayment = await repository.updateOne(
      GiftCardPaymentModel,
      { _id: payment._id },
      {
        paymentStatus: paymentStatus.FAILED,
        payhere_payment_id: payment_id,
        method: method,
        status_message: status_message,
      },
      { new: true }
    );

    return {
      payment: updatedPayment.toObject(),
      giftCard: null,
      error: true,
      message: 'Payment failed. Please try again.',
    };
  }
};

/**
 * Get gift card payment by payment ID
 * @param {String} payment_id - Payment ID
 * @returns {Promise<Object>}
 */
module.exports.getGiftCardPaymentById = async (payment_id) => {
  const payment = await repository.findOne(GiftCardPaymentModel, {
    payment_id: payment_id,
  });

  if (!payment) {
    return null;
  }

  // Populate related fields manually using repository
  const paymentObj = payment.toObject();

  if (payment.gift_card_id) {
    const giftCard = await repository.findOne(GiftCardModel, {
      _id: payment.gift_card_id,
    });
    if (giftCard) {
      paymentObj.gift_card_id = giftCard.toObject();
      delete paymentObj.gift_card_id.pin; // Never return hashed PIN
      // Include temporary PIN if available
      if (payment.temporaryPin) {
        paymentObj.gift_card_id.pin = payment.temporaryPin;
      }
    }
  }

  if (payment.user_id) {
    const UserModel = require('../users/user.model');
    const user = await repository.findOne(UserModel, {
      _id: payment.user_id,
    });
    if (user) {
      const userObj = user.toObject();
      // Only return name and email
      paymentObj.user_id = {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
      };
    }
  }

  return paymentObj;
};
