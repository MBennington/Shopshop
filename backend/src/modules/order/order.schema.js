const joi = require('joi');
const { paymentMethod } = require('../../config/order.config');

module.exports.createOrder = joi.object({
  address: joi
    .object({
      firstName: joi.string().required(),
      lastName: joi.string().required(),
      label: joi.string().allow('').optional(),
      address: joi.string().required(),
      city: joi.string().required(),
      province: joi.string().required(),
      postalCode: joi.string().required(),
      country: joi.string().required(),
      phone: joi.string().required(),
    })
    .required(),
  paymentMethod: joi
    .string()
    .valid(...Object.values(paymentMethod))
    .required(),
  fromCart: joi.boolean().required(),

  // Fields required only when fromCart = false
  product: joi.when('fromCart', {
    is: false,
    then: joi
      .object({
        product_id: joi.string().required(),
        quantity: joi.number().min(1),
        size: joi.string().allow('').optional(),
        color: joi.string().required(),
      })
      .required(),
    otherwise: joi.forbidden(),
  }),

  // Gift card codes (optional)
  giftCards: joi.array().items(
    joi.object({
      code: joi.string().trim().required(),
    })
  ).optional(),
});

module.exports.findOrderById = joi.object({
  order_id: joi.string().required(),
});

module.exports.getOrdersByUser = joi.object({
  page: joi.number().integer().min(1).optional(),
  limit: joi.number().integer().min(1).max(100).optional(),
  status: joi.string().optional(),
});
