const joi = require('joi');

module.exports.createReview = joi.object({
  product: joi.string().required(),
  rating: joi.number().integer().min(1).max(5).required(),
  title: joi.string().trim().max(100).optional(),
  content: joi.string().trim().min(1).max(1000).required(),
});

module.exports.updateReview = joi.object({
  rating: joi.number().integer().min(1).max(5).optional(),
  title: joi.string().trim().max(100).optional(),
  content: joi.string().trim().min(1).max(1000).optional(),
});

module.exports.getReviewsQuery = joi.object({
  product: joi.string().required(),
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(50).default(10),
  sort: joi
    .string()
    .valid('newest', 'oldest', 'rating_high', 'rating_low', 'helpful')
    .default('newest'),
});
