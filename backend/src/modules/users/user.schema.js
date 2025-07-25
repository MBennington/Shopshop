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

const contactDetailsSchema = joi.object({
  address: joi.string(),
  city: joi.string(),
  postalCode: joi.string(),
  country: joi.string(),
});

const payoutsSchema = joi.object({
  paymentMethod: joi.string(),
  accountNumber: joi.string(),
  routingNumber: joi.string(),
});

const sellerInfoSchema = joi.object({
  businessName: joi.string(),
  phone: joi.string(),
  businessType: joi.string(),
  contactDetails: contactDetailsSchema.optional(),
  payouts: payoutsSchema.optional(),
});

const notificationsSchema = joi.object({
  orderUpdates: joi.boolean(),
  productInquiries: joi.boolean(),
  marketingEmails: joi.boolean(),
});

const privacySettingsSchema = joi.object({
  twoFactorAuth: joi.boolean(),
});

const accountPreferencesSchema = joi.object({
  language: joi.string(),
  currency: joi.string(),
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

module.exports.updateUserProfile = joi.object({
  name: joi.string(),
  email: joi.string().email(),
  role: joi.string().valid('seller', 'buyer'),
  sellerInfo: sellerInfoSchema,
  notifications: notificationsSchema,
  privacySettings: privacySettingsSchema,
  accountPreferences: accountPreferencesSchema,
  profilePicture: joi.string().uri(),
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
