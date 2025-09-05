const joi = require('joi');
const { paymentMethod } = require('../../config/order.config');

module.exports.createOrder = joi.object({
  address: joi.string().required(),
  paymentMethod: joi
    .string()
    .valid(...Object.values(paymentMethod))
    .required(),
  fromCart: joi.boolean().required(),

  // Fields required only when fromCart = false
  product_id: joi.when('fromCart', {
    is: false,
    then: joi.string().required(),
    otherwise: joi.forbidden(),
  }),

  quantity: joi.when('fromCart', {
    is: false,
    then: joi.number().min(1).required(),
    otherwise: joi.forbidden(),
  }),

  color: joi.when('fromCart', {
    is: false,
    then: joi.string().optional(),
    otherwise: joi.forbidden(),
  }),

  size: joi.when('fromCart', {
    is: false,
    then: joi.string().optional(),
    otherwise: joi.forbidden(),
  }),
});
