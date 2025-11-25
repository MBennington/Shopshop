const joi = require('joi');

module.exports.purchaseGiftCard = joi.object().keys({
  amount: joi.number().min(500).max(50000).required(),
  recipientEmail: joi.string().email({ tlds: { allow: false } }).optional().allow(null, ''),
});

module.exports.validateGiftCard = joi.object().keys({
  code: joi.string().trim().required(),
  pin: joi.string().pattern(/^\d{4}$/).required().messages({
    'string.pattern.base': 'PIN must be exactly 4 digits',
  }),
});

module.exports.sendGiftCardEmail = joi.object().keys({
  code: joi.string().trim().required(),
  recipientEmail: joi.string().email({ tlds: { allow: false } }).required(),
  message: joi.string().max(500).optional().allow(null, ''),
});

