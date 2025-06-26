const express = require("express");

const router = express.Router();

const validator = require("../../services/validator.service");
const { permissions } = require("./user.permission");
const controller = require("./user.controller");
const schema = require("./user.schema");

router
  .route(permissions.createUser.path)
  .post(validator.validateBody(schema.createUser), controller.createUser);

router
  .route(permissions.login.path)
  .post(validator.validateBody(schema.login), controller.login);

module.exports = router;