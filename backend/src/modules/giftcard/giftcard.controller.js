const giftCardService = require('./giftcard.service');
const {
  successWithData,
  successWithMessage,
  customError,
} = require('../../services/response.service');

// Old purchaseGiftCard controller removed - use initiateGiftCardPurchase instead

/**
 * Validate Gift Card
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.validateGiftCard = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const { code } = req.body;

    if (!code) {
      return customError('Gift card code is required', res);
    }

    const giftCard = await giftCardService.validateGiftCard(code, user_id);
    return successWithData(giftCard, res);
  } catch (error) {
    console.error('Validate gift card error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Get User's Gift Cards
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getUserGiftCards = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const giftCards = await giftCardService.getUserGiftCards(user_id);
    return successWithData(giftCards, res);
  } catch (error) {
    console.error('Get user gift cards error:', error);
    return customError(`${error.message}`, res);
  }
};

// Old sendGiftCardEmail controller removed - gift cards are sent automatically after payment

/**
 * Initiate Gift Card Purchase Payment
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.initiateGiftCardPurchase = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const data = await giftCardService.initiateGiftCardPurchase(
      req.body,
      user_id
    );
    return successWithData(data, res);
  } catch (error) {
    console.error('Initiate gift card purchase error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Update Gift Card Payment Status
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.updateGiftCardPaymentStatus = async (req, res) => {
  try {
    // console.log('=== Gift Card Payment Status Update ===');
    // console.log('Request body:', JSON.stringify(req.body, null, 2));
    // console.log('Status code type:', typeof req.body.status_code, 'Value:', req.body.status_code);

    const data = await giftCardService.updateGiftCardPaymentStatus(req.body);

    //console.log('Payment status updated successfully:', JSON.stringify(data, null, 2));
    return successWithData(data, res);
  } catch (error) {
    //console.error('Update gift card payment status error:', error);
    //console.error('Error stack:', error.stack);
    return customError(`${error.message}`, res);
  }
};

/**
 * Get Gift Card Payment by Payment ID
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getGiftCardPaymentById = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const payment = await giftCardService.getGiftCardPaymentById(payment_id);

    if (!payment) {
      return customError('Payment not found', res);
    }

    // Include gift card details if available
    let responseData = { payment };

    if (payment.gift_card_id && typeof payment.gift_card_id === 'object') {
      // Gift card is populated
      const giftCard = payment.gift_card_id;

      responseData.giftCard = giftCard;
    }

    return successWithData(responseData, res);
  } catch (error) {
    console.error('Get gift card payment error:', error);
    return customError(`${error.message}`, res);
  }
};

// Old acceptance flow controllers removed:
// - sendGiftCard
// - getGiftCardByAcceptanceToken
// - acceptGiftCard
// New flow: Gift cards are sent directly via email with PDF after payment
