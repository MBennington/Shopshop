const express = require('express');
const upload = require('../../services/multer.service');

const router = express.Router();

const validator = require('../../services/validator.service');
const { permissions } = require('./user.permission');
const controller = require('./user.controller');
const schema = require('./user.schema');

// Public routes
router
  .route(permissions.createUser.path)
  .post(validator.validateBody(schema.createUser), controller.createUser);

router
  .route(permissions.login.path)
  .post(validator.validateBody(schema.login), controller.login);

// Protected routes - require authentication
router
  .route(permissions.getUserProfile.path)
  .get(
    validator.validateHeader(permissions.getUserProfile.grantedUserRoles),
    controller.getUserProfile
  );

router
  .route(permissions.updateUserProfile.path)
  .put(
    upload.single('profilePicture'),
    validator.validateHeader(permissions.updateUserProfile.grantedUserRoles),
    validator.validateBody(schema.updateUserProfile),
    controller.updateUserProfile
  );

// router
//   .route(permissions.changePassword.path)
//   .put(
//     validator.validateHeader(permissions.changePassword.grantedUserRoles),
//     validator.validateBody(schema.changePassword),
//     controller.changePassword
//   );

// router
//   .route(permissions.deleteUser.path)
//   .delete(
//     validator.validateHeader(permissions.deleteUser.grantedUserRoles),
//     validator.validateBody(schema.deleteUser),
//     controller.deleteUser
//   );

// Admin routes
// router
//   .route(permissions.getAllUsers.path)
//   .get(
//     validator.validateHeader(permissions.getAllUsers.grantedUserRoles),
//     validator.validateQueryParameters(schema.getAllUsers),
//     controller.getAllUsers
//   );

// router
//   .route(permissions.getUserById.path)
//   .get(
//     validator.validateHeader(permissions.getUserById.grantedUserRoles),
//     controller.getUserById
//   );

// router
//   .route(permissions.updateUserRole.path)
//   .put(
//     validator.validateHeader(permissions.updateUserRole.grantedUserRoles),
//     validator.validateBody(schema.updateUserRole),
//     controller.updateUserRole
//   );

module.exports = router;
