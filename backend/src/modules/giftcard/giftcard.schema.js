const joi = require('joi');

module.exports.purchaseGiftCard = joi.object().keys({
  amount: joi.number().min(500).max(50000).required(),
  recipientEmail: joi.string().email({ tlds: { allow: false } }).required(),
  recipientName: joi.string().trim().max(100).optional().allow(null, ''),
  personalMessage: joi.string().trim().max(200).optional().allow(null, ''),
}).unknown(false); // Don't allow unknown fields

module.exports.validateGiftCard = joi.object().keys({
  code: joi.string().trim().required(),
});

// Old schemas removed:
// - sendGiftCardEmail (unused endpoint)
// - sendGiftCard (old acceptance flow)

