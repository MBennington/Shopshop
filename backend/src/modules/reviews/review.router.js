const express = require('express');
const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./review.permission');
const controller = require('./review.controller');
const schema = require('./review.schema');

router
  .route(permissions.createReview.path)
  .post(
    validator.validateHeader(permissions.createReview.grantedUserRoles),
    validator.validateBody(schema.createReview),
    controller.createReview
  );

router
  .route(permissions.getReviews.path)
  .get(
    validator.validateQueryParameters(schema.getReviewsQuery),
    controller.getReviews
  );

router
  .route('/summary/:productId')
  .get(controller.getReviewSummary);

router
  .route(permissions.updateReview.path)
  .put(
    validator.validateHeader(permissions.updateReview.grantedUserRoles),
    validator.validateBody(schema.updateReview),
    controller.updateReview
  );

router
  .route(permissions.deleteReview.path)
  .delete(
    validator.validateHeader(permissions.deleteReview.grantedUserRoles),
    controller.deleteReview
  );

module.exports = router;
