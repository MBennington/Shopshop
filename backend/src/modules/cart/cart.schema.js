const joi = require('joi');
const { sizes } = require('../../config/sizes.config');

module.exports.createOrUpdateCart = joi.object({
  product_id: joi.string().required(),
  qty: joi.number().integer().min(1).required(),
  size: joi
    .string()
    .valid(...sizes)
    .optional(),
  color: joi.string().trim().required(),
});

module.exports.removeFromCart = joi.object({
  product_id: joi.string().required(),
  size: joi
    .string()
    .valid(...sizes)
    .optional(),
  color: joi.string().trim().required(),
});
