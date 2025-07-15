const joi = require('joi');
const { categories } = require('../../config/category.config');
const { sizes } = require('../../config/sizes.config');
const { status } = require('../../config/status.config');

module.exports.createProduct = joi.object({
  name: joi.string().trim().min(1).required(),

  category: joi
    .string()
    .valid(...Object.values(categories))
    .required(),

  price: joi.number().positive().required(),

  description: joi.string().trim().required(),

  hasSizes: joi.boolean().default(false),

  totalImages: joi.number().integer().min(0),

  totalColors: joi.number().integer().min(1),

  totalSizes: joi.number().integer().min(0),

  colors: joi
    .array()
    .items(
      joi.object({
        colorCode: joi.string().trim().required(),
        colorName: joi.string().trim().required(),
        images: joi.array().items(joi.string()).optional(),
        sizes: joi
          .array()
          .items(
            joi.object({
              size: joi.string().valid(...sizes),
              quantity: joi.number().integer().min(0),
            })
          )
          .optional(),
        quantity: joi.number().integer().min(0).optional(),
      })
    )
    .min(1)
    .required(),

  status: joi.string().valid(...Object.values(status)),
});
