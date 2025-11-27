const giftCardService = require('./giftcard.service');
const {
  successWithData,
  successWithMessage,
  customError,
} = require('../../services/response.service');

/**
 * Purchase Gift Card
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.purchaseGiftCard = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const data = await giftCardService.purchaseGiftCard(req.body, user_id);
    return successWithData(data, res);
  } catch (error) {
    console.error('Purchase gift card error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Validate Gift Card
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.validateGiftCard = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const { code, pin } = req.body;

    if (!code || !pin) {
      return customError('Gift card code and PIN are required', res);
    }

    const giftCard = await giftCardService.validateGiftCard(code, pin, user_id);
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

/**
 * Send Gift Card via Email
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.sendGiftCardEmail = async (req, res) => {
  try {
    const { code, recipientEmail, message } = req.body;

    // Validate gift card exists
    const giftCard = await giftCardService.getGiftCardByCode(code);
    if (!giftCard) {
      return customError('Gift card not found', res);
    }

    // TODO: Implement email service
    // For now, just update the email recipient
    // In production, send actual email with gift card details

    return successWithMessage('Gift card email sent successfully', res);
  } catch (error) {
    console.error('Send gift card email error:', error);
    return customError(`${error.message}`, res);
  }
};

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
      delete giftCard.pin; // Never return hashed PIN

      // Include temporary PIN if available (only once)
      if (payment.temporaryPin) {
        giftCard.pin = payment.temporaryPin;
        // Clear temporary PIN after retrieval (optional - for security)
        // await giftCardService.clearTemporaryPin(payment_id);
      }

      responseData.giftCard = giftCard;
    }

    return successWithData(responseData, res);
  } catch (error) {
    console.error('Get gift card payment error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Send Gift Card to Receiver
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.sendGiftCard = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const user_name = res.locals.user.name;
    const { giftCardId, receiverEmail } = req.body;

    const giftCard = await giftCardService.sendGiftCard(
      giftCardId,
      receiverEmail,
      user_id,
      user_name
    );

    return successWithData(giftCard, res);
  } catch (error) {
    console.error('Send gift card error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Get Gift Card by Acceptance Token
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getGiftCardByAcceptanceToken = async (req, res) => {
  try {
    const { token } = req.params;
    const data = await giftCardService.getGiftCardByAcceptanceToken(token);

    return successWithData(data, res);
  } catch (error) {
    console.error('Get gift card by acceptance token error:', error);
    return customError(`${error.message}`, res);
  }
};

/**
 * Accept Gift Card
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.acceptGiftCard = async (req, res) => {
  try {
    const { token } = req.params;
    const user_id = res.locals.user.id;
    const user_name = res.locals.user.name;
    const user_email = res.locals.user.email;

    const giftCard = await giftCardService.acceptGiftCard(
      token,
      user_id,
      user_name,
      user_email
    );

    return successWithData(giftCard, res);
  } catch (error) {
    console.error('Accept gift card error:', error);
    return customError(`${error.message}`, res);
  }
};
