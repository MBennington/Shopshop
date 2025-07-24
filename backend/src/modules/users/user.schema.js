const joi = require('joi');
const { roles } = require('../../config/role.config');

const passwordValidation = joi
  .string()
  .min(8)
  .regex(/^\S+$/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must not contain spaces',
  });

module.exports.createUser = joi.object().keys({
  name: joi.string().trim().min(1).required(),
  email: joi
    .string()
    .email({ tlds: { allow: false } })
    .required(),
  password: passwordValidation,
  role: joi
    .string()
    .valid(...Object.values(roles))
    .required(),

  // seller-specific fields (conditionally required)
  businessName: joi.when('role', {
    is: 'seller',
    then: joi.string().required(),
    otherwise: joi.optional(),
  }),
  phone: joi.when('role', {
    is: 'seller',
    then: joi.string().required(),
    otherwise: joi.optional(),
  }),
  businessType: joi.when('role', {
    is: 'seller',
    then: joi.string().required(),
    otherwise: joi.optional(),
  }),
});

module.exports.login = joi.object().keys({
  email: joi
    .string()
    .email({ tlds: { allow: false } })
    .required(),
  password: passwordValidation,
});

module.exports.updateUserProfile = joi.object().keys({
  name: joi.string().trim().min(1).optional(),
  role: joi
    .string()
    .valid(...Object.values(roles))
    .optional(),

  // seller-specific fields (conditionally required)
  businessName: joi.when('role', {
    is: 'seller',
    then: joi.string().optional(),
    otherwise: joi.optional(),
  }),
  phone: joi.when('role', {
    is: 'seller',
    then: joi.string().optional(),
    otherwise: joi.optional(),
  }),
  businessType: joi.when('role', {
    is: 'seller',
    then: joi.string().optional(),
    otherwise: joi.optional(),
  }),
});

module.exports.changePassword = joi.object().keys({
  currentPassword: passwordValidation,
  newPassword: passwordValidation,
});

module.exports.deleteUser = joi.object().keys({
  password: passwordValidation,
});

module.exports.updateUserRole = joi.object().keys({
  role: joi
    .string()
    .valid(...Object.values(roles))
    .required(),
});

module.exports.getAllUsers = joi.object().keys({
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
  search: joi.string().trim().min(1).optional(),
});
