const reviewService = require('./review.service');
const {
  successWithData,
  successWithMessage,
  customError,
} = require('../../services/response.service');

/**
 * Create a new review
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.createReview = async (req, res) => {
  try {
    const userId = res.locals.user.id;
    const data = await reviewService.createReview(req.body, userId);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get reviews for a product with pagination
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getReviews = async (req, res) => {
  try {
    const data = await reviewService.getReviews(req.query);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get review summary for a product
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getReviewSummary = async (req, res) => {
  try {
    const { productId } = req.params;
    const { previewLimit = 5 } = req.query;
    const data = await reviewService.getReviewSummary(
      productId,
      parseInt(previewLimit)
    );
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Update a review
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = res.locals.user.id;
    const data = await reviewService.updateReview(reviewId, req.body, userId);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Delete a review
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = res.locals.user.id;
    await reviewService.deleteReview(reviewId, userId);
    return successWithMessage('Review deleted successfully', res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};
