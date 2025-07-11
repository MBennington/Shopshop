const joi = require('joi');
const { categories } = require('../../config/category.config');
const { sizes } = require('../../config/sizes.config');

module.exports.createProduct = joi.object({
  name: joi.string().trim().min(1).required(),

  category: joi
    .string()
    .valid(...Object.values(categories))
    .required(),

  price: joi.number().positive().required(),

  description: joi.string().trim().required(),

  sizes: joi
    .array()
    .items(joi.string().valid(...sizes))
    .default([]),

  colors: joi
    .array()
    .items(
      joi.object({
        colorCode: joi.string().trim().required(),
        images: joi.array().items(joi.string()).optional(),
      })
    )
    .optional(),
});
