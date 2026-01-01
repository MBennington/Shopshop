const joi = require('joi');

module.exports.createPayoutRequest = joi.object({
  amount_requested: joi.number().positive().required(),
  method: joi.string().valid('BANK_TRANSFER').default('BANK_TRANSFER'),
});

module.exports.approvePayout = joi.object({
  admin_note: joi.string().optional().allow(null, ''),
});

module.exports.rejectPayout = joi.object({
  admin_note: joi.string().required(),
});

module.exports.markPayoutAsPaid = joi.object({
  amount_paid: joi.number().positive().optional(),
  receipt_urls: joi.array().items(joi.string().uri()).optional().default([]),
  admin_note: joi.string().optional().allow(null, ''),
});

module.exports.getPayouts = joi.object({
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
  status: joi.string().valid('PENDING', 'APPROVED', 'PAID', 'REJECTED', 'FAILED', 'CANCELLED').optional(),
  seller_id: joi.string().optional(),
});


