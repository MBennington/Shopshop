const GiftCardModel = require('./giftcard.model');
const GiftCardPaymentModel = require('./giftcard-payment.model');
const repository = require('../../services/repository.service');
const emailService = require('../../services/email.service');
const pdfService = require('../../services/pdf.service');
const {
  giftCardStatus,
  giftCardConfig,
} = require('../../config/giftcard.config');
const { paymentStatus } = require('../../config/order.config');
const crypto = require('crypto');
const mongoose = require('mongoose');
const md5 = require('crypto-js/md5');

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

// Old purchaseGiftCard function removed - use initiateGiftCardPurchase instead

/**
 * Validate and redeem gift card
 * @param {String} code - Gift card code
 * @param {String} user_id - User ID redeeming
 * @returns {Promise<Object>}
 */
module.exports.validateGiftCard = async (code, user_id) => {
  const giftCard = await GiftCardModel.findOne({ code: code.toUpperCase() });

  if (!giftCard) {
    throw new Error('Invalid gift card code');
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
  orderTotal,
  user_id,
  order_id
) => {
  const giftCard = await this.validateGiftCard(code, user_id);

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
 * Get user's gift cards (purchased and received)
 * @param {String} user_id - User ID
 * @returns {Promise<Object>} { purchased, received }
 */
module.exports.getUserGiftCards = async (user_id) => {
  const now = new Date();

  // Get gift cards purchased by user
  const purchasedCards = await GiftCardModel.find({
    purchasedBy: user_id,
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

  // Get gift cards received by user (by email)
  const UserModel = require('../users/user.model');
  const user = await repository.findOne(UserModel, { _id: user_id });
  const userEmail = user?.email?.toLowerCase();

  const receivedCards = userEmail
    ? await GiftCardModel.find({
        receiverEmail: userEmail,
        purchasedBy: { $ne: user_id }, // Not purchased by themselves
        status: {
          $in: [
            giftCardStatus.ACTIVE,
            giftCardStatus.FULLY_REDEEMED,
            giftCardStatus.EXPIRED,
          ],
        },
      })
        .sort({ created_at: -1 })
        .lean()
    : [];

  // Helper function to process cards
  const processCards = (cards) => {
    return cards.map((card) => {
      const isExpired = now > new Date(card.expiryDate);
      const cardObj = {
        ...card,
        isExpired,
        status:
          isExpired && card.status === giftCardStatus.ACTIVE
            ? giftCardStatus.EXPIRED
            : card.status,
      };
      return cardObj;
    });
  };

  return {
    purchased: processCards(purchasedCards),
    received: processCards(receivedCards),
  };
};

// getGiftCardByCode removed - only used by unused sendGiftCardEmail endpoint

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

  // Validate recipient email is required (always sending to others)
  if (!recipientEmail || !recipientEmail.trim()) {
    throw new Error('Recipient email is required. Gift cards are always sent to others.');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipientEmail.trim())) {
    throw new Error('Please provide a valid recipient email address.');
  }

  // Extract optional fields
  const recipientName = body.recipientName?.trim() || null;
  const personalMessage = body.personalMessage?.trim() || null;

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
      recipientName: recipientName || null,
      personalMessage: personalMessage || null,
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
 * @returns {Promise<Object>} Gift card
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
      // Return existing gift card
      // This should not happen in normal flow, but handle gracefully
      throw new Error('Gift card already created for this payment');
    }
  }

  const { amount, recipientEmail } = payment.purchaseDetails;

  // Validate recipient email is required
  if (!recipientEmail || !recipientEmail.trim()) {
    throw new Error('Recipient email is required for gift card creation.');
  }

  // Generate unique code
  const code = await generateGiftCardCode();

  // Calculate expiry date
  const expiryDate = calculateExpiryDate();

  // Get purchase details
  const { recipientName, personalMessage } = payment.purchaseDetails;

  // Create gift card
  // Note: If personalMessage is not provided, the model default will be used
  const giftCard = new GiftCardModel({
    code,
    amount,
    remainingBalance: amount,
    purchasedBy: payment.user_id,
    receiverEmail: recipientEmail.toLowerCase().trim(),
    recipientName: recipientName || null,
    // Only set personalMessage if provided, otherwise let model default apply
    ...(personalMessage && personalMessage.trim() ? { personalMessage: personalMessage.trim() } : {}),
    expiryDate,
    status: giftCardStatus.ACTIVE,
  });

  await repository.save(giftCard);

  // Update payment record with gift card ID
  await repository.updateOne(
    GiftCardPaymentModel,
    { _id: payment._id },
    {
      gift_card_id: giftCard._id,
    },
    { new: true }
  );

  // Generate PDF and send email with PDF attachment
  try {
    // Fetch gift card from DB to get all saved data
    const savedGiftCard = await repository.findOne(GiftCardModel, {
      _id: giftCard._id,
    });

    const UserModel = require('../users/user.model');
    const sender = await repository.findOne(UserModel, {
      _id: payment.user_id,
    });
    const senderName = sender ? sender.name : 'Someone';

    // Get recipient name and message from gift card (from DB)
    const recipientName = savedGiftCard.recipientName;
    const personalMessage = savedGiftCard.personalMessage;

    // Generate PDF
    const pdfBuffer = await pdfService.generateGiftCardPDF({
      code: savedGiftCard.code,
      amount: savedGiftCard.amount,
      expiryDate: savedGiftCard.expiryDate,
      recipientName: recipientName || null,
      senderName: senderName,
      personalMessage: personalMessage || null,
    });

    // Send email with PDF attachment (simplified message)
    await emailService.sendEmail({
      to: recipientEmail.toLowerCase().trim(),
      subject: `🎁 You've Received a Gift Card from ${senderName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You've Received a Gift Card!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF0808 0%, #FF4040 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎁 You've Received a Gift Card!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Hi ${recipientName || 'there'},</p>
            
            <p style="font-size: 16px;">
              <strong>${senderName}</strong> has sent you a gift card!
            </p>
            
            <p style="font-size: 16px;">
              Your gift card PDF is attached to this email. You can use the gift card code from the PDF at checkout to apply the balance to your purchase.
            </p>
            
            <p style="font-size: 16px; margin-top: 20px;">
              Happy shopping! 🛍️
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              This is an automated email from Shopshop. Please do not reply to this email.
            </p>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `GiftCard-${giftCard.code}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  } catch (error) {
    console.error('Error generating PDF or sending gift card email:', error);
    // Don't fail the operation if PDF/email fails, but log it
  }

  // Return gift card from DB
  const savedGiftCard = await repository.findOne(GiftCardModel, {
    _id: giftCard._id,
  });
  return savedGiftCard.toObject();
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
            }
          }
        } else {
          //console.error('Error creating gift card after payment:', error);
          throw error;
        }
      }
    } else {
      // Gift card already exists, fetch it
      const updatedPayment = await repository.findOne(GiftCardPaymentModel, {
        _id: payment._id,
      });
      const existingGiftCard = await repository.findOne(GiftCardModel, {
        _id: payment.gift_card_id,
      });
      if (existingGiftCard) {
        giftCard = existingGiftCard.toObject();
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

// Old acceptance flow functions removed:
// - sendGiftCard (old flow where you send an already-purchased gift card)
// - getGiftCardByAcceptanceToken
// - acceptGiftCard
// - generateAcceptanceToken
// New flow: Gift cards are sent directly via email with PDF after payment
