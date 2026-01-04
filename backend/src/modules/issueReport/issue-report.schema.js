const joi = require('joi');

module.exports.createIssueReport = joi.object({
  issueType: joi
    .string()
    .valid('order', 'product', 'delivery', 'payment', 'review', 'other')
    .required(),
  subject: joi.string().trim().min(1).max(200).required(),
  description: joi.string().trim().min(1).max(2000).required(),
  orderId: joi.string().trim().allow('', null).optional(),
  productId: joi.string().trim().allow('', null).optional(),
});

module.exports.updateIssueReport = joi.object({
  status: joi
    .string()
    .valid('pending', 'in_progress', 'resolved', 'closed')
    .optional(),
  adminNotes: joi.string().trim().max(1000).allow('', null).optional(),
});


