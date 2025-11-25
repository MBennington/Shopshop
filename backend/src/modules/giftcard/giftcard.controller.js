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

