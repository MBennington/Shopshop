const joi = require('joi');

module.exports.addToWishlist = joi.object({
  product_id: joi.string().required(),
  color_id: joi.string().required(),
});

module.exports.removeFromWishlist = joi.object({
  product_id: joi.string().required(),
  color_id: joi.string().required(),
});

module.exports.addWishlistItemToCart = joi.object({
  product_id: joi.string().required(),
  color_id: joi.string().required(),
  qty: joi.number().integer().min(1).optional().default(1),
  size: joi.string().optional(),
});

