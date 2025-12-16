const joi = require('joi');
const { subOrderStatus, deliveryStatus } = require('../../config/suborder.config');

// For GET /api/suborder/seller/:sellerId - validates query parameters
module.exports.getSubOrdersBySeller = joi.object({
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
  status: joi.string().valid(...Object.values(subOrderStatus)).optional(),
});

// For PUT /api/suborder/:id/status - validates req.body
module.exports.updateSubOrderStatus = joi.object({
  orderStatus: joi.string().valid(...Object.values(subOrderStatus)).required(),
});

// For PUT /api/suborder/:id/tracking - validates req.body
module.exports.updateTrackingNumber = joi.object({
  tracking_number: joi.string().trim().required(),
});

// For PUT /api/suborder/:id/confirm-delivery - validates req.body
module.exports.confirmDelivery = joi.object({
  delivery_confirmed: joi.boolean().required(),
});

// For PUT /api/suborder/:id/buyer-confirm-delivery - validates req.body
module.exports.buyerConfirmDelivery = joi.object({
  confirmed: joi.boolean().required(),
});