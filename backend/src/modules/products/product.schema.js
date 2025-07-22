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
});

module.exports.updateProduct = joi.object({
  name: joi.string().trim().min(1).optional(),

  category: joi
    .string()
    .valid(...Object.values(categories))
    .optional(),

  price: joi.number().positive().optional(),

  description: joi.string().trim().optional(),

  hasSizes: joi.boolean().optional(),

  totalImages: joi.number().integer().min(0).optional(),

  totalColors: joi.number().integer().min(1).optional(),

  totalSizes: joi.number().integer().min(0).optional(),

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
    .optional(),
});

module.exports.getProducts = joi.object({
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
  category: joi.string().valid(...Object.values(categories)).optional(),
  search: joi.string().trim().min(1).optional(),
  sort: joi.string().valid('featured', 'price_asc', 'price_desc', 'newest').default('featured'),
  order: joi.string().valid('asc', 'desc').default('desc'),
  minPrice: joi.number().min(0).optional(),
  maxPrice: joi.number().min(0).optional(),
  seller_id: joi.string().optional(),
});
