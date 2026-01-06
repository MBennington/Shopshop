const joi = require('joi');

module.exports.addToWishlist = joi.object({
  product_id: joi.string().required(),
  color_id: joi.string().required(),
});

