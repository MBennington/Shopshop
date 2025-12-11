const ReviewModel = require('./review.model');
const ProductModel = require('../products/product.model');
const UserModel = require('../users/user.model');
const repository = require('../../services/repository.service');
const mongoose = require('mongoose');

/**
 * Create a new review
 * @param {Object} reviewData
 * @param {string} userId
 * @returns {Promise<Object>}
 */
module.exports.createReview = async (reviewData, userId) => {
  const { product, rating, title, content } = reviewData;

  // Check if product exists
  const productExists = await repository.findOne(ProductModel, {
    _id: new mongoose.Types.ObjectId(product),
  });
  if (!productExists) {
    throw new Error('Product not found');
  }

  // Check if user already reviewed this product
  const existingReview = await repository.findOne(ReviewModel, {
    user: new mongoose.Types.ObjectId(userId),
    product: new mongoose.Types.ObjectId(product),
  });

  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }

  // Create the review
  const review = await repository.save(
    new ReviewModel({
      user: new mongoose.Types.ObjectId(userId),
      product: new mongoose.Types.ObjectId(product),
      rating: parseInt(rating),
      title: title?.trim(),
      content: content.trim(),
      isVerified: false, // Will be updated when purchase verification is implemented
    })
  );

  return review;
};

/**
 * Get reviews for a product with pagination
 * @param {Object} query
 * @returns {Promise<Object>}
 */
module.exports.getReviews = async (query) => {
  const { product, page = 1, limit = 10, sort = 'newest' } = query;

  // Build filter
  const filter = {
    product: new mongoose.Types.ObjectId(product),
  };

  // Build sort options
  let sortOptions = {};
  switch (sort) {
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'oldest':
      sortOptions = { createdAt: 1 };
      break;
    case 'rating_high':
      sortOptions = { rating: -1, createdAt: -1 };
      break;
    case 'rating_low':
      sortOptions = { rating: 1, createdAt: -1 };
      break;
    case 'helpful':
      sortOptions = { createdAt: -1 };
      break;
    default:
      sortOptions = { createdAt: -1 };
  }

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Get reviews with user data
  const reviews = await ReviewModel.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData',
      },
    },
    { $unwind: '$userData' },
    {
      $project: {
        _id: 1,
        rating: 1,
        title: 1,
        content: 1,
        isVerified: 1,
        createdAt: 1,
        'userData._id': 1,
        'userData.name': 1,
        'userData.email': 1,
        'userData.profilePicture': 1,
      },
    },
    { $sort: sortOptions },
    { $skip: skip },
    { $limit: parseInt(limit) },
  ]);

  // Convert userData._id to string for each review
  const formattedReviews = reviews.map((review) => ({
    ...review,
    userData: {
      ...review.userData,
      _id: review.userData._id?.toString() || review.userData._id,
    },
  }));

  // Get total count
  const total = await repository.countDocuments(ReviewModel, filter);

  return {
    reviews: formattedReviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get review summary for a product (for product details page)
 * @param {string} productId
 * @param {number} previewLimit - Number of reviews to include in preview
 * @returns {Promise<Object>}
 */
module.exports.getReviewSummary = async (productId, previewLimit = 5) => {
  const productObjectId = new mongoose.Types.ObjectId(productId);

  // Get rating aggregation
  const ratingStats = await ReviewModel.aggregate([
    { $match: { product: productObjectId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating',
        },
      },
    },
  ]);

  // Get rating distribution
  const distribution = await ReviewModel.aggregate([
    { $match: { product: productObjectId } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  // Format rating distribution
  const ratingDistribution = {};
  for (let i = 5; i >= 1; i--) {
    const ratingData = distribution.find((d) => d._id === i);
    ratingDistribution[i] = ratingData ? ratingData.count : 0;
  }

  // Get preview reviews
  const previewReviews = await ReviewModel.aggregate([
    { $match: { product: productObjectId } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData',
      },
    },
    { $unwind: '$userData' },
    {
      $project: {
        _id: 1,
        rating: 1,
        title: 1,
        content: 1,
        isVerified: 1,
        createdAt: 1,
        'userData._id': 1,
        'userData.name': 1,
        'userData.email': 1,
        'userData.profilePicture': 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: previewLimit },
  ]);

  // Convert userData._id to string for each preview review
  const formattedPreviewReviews = previewReviews.map((review) => ({
    ...review,
    userData: {
      ...review.userData,
      _id: review.userData._id?.toString() || review.userData._id,
    },
  }));

  const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0 };

  return {
    averageRating: Math.round(stats.averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: stats.totalReviews,
    ratingDistribution,
    previewReviews: formattedPreviewReviews,
  };
};

/**
 * Update a review
 * @param {string} reviewId
 * @param {Object} updateData
 * @param {string} userId
 * @returns {Promise<Object>}
 */
module.exports.updateReview = async (reviewId, updateData, userId) => {
  const review = await repository.findOne(ReviewModel, {
    _id: new mongoose.Types.ObjectId(reviewId),
  });

  if (!review) {
    throw new Error('Review not found');
  }

  // Check if user owns the review
  if (review.user.toString() !== userId) {
    throw new Error('You can only update your own reviews');
  }

  const updatedReview = await repository.updateOne(
    ReviewModel,
    { _id: new mongoose.Types.ObjectId(reviewId) },
    updateData,
    { new: true }
  );

  return updatedReview;
};

/**
 * Delete a review
 * @param {string} reviewId
 * @param {string} userId
 * @returns {Promise<void>}
 */
module.exports.deleteReview = async (reviewId, userId) => {
  const review = await repository.findOne(ReviewModel, {
    _id: new mongoose.Types.ObjectId(reviewId),
  });

  if (!review) {
    throw new Error('Review not found');
  }

  // Check if user owns the review
  if (review.user.toString() !== userId) {
    throw new Error('You can only delete your own reviews');
  }

  await repository.deleteOne(ReviewModel, {
    _id: new mongoose.Types.ObjectId(reviewId),
  });
};
