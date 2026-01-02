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
  bankAccountNumber: joi.string(),
  bankAccountName: joi.string(),
  bankName: joi.string(),
});

const sellerInfoSchema = joi.object({
  businessName: joi.string(),
  phone: joi.string(),
  businessType: joi.string(),
  contactDetails: contactDetailsSchema.optional(),
  businessDescription: joi.string().optional(),
  payouts: payoutsSchema.optional(),
  baseShippingFee: joi.number().min(0).optional().allow(null),
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

const addressSchema = joi.object({
  _id: joi.string().optional().allow(null),
  label: joi.string().required(),
  address: joi.string().required(),
  city: joi.string().required(),
  province: joi.string().required(),
  postalCode: joi.string().required(),
  country: joi.string().required(),
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
  savedAddresses: joi.array().items(addressSchema),
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
  role: joi.string().valid(...Object.values(roles)).optional(),
});

module.exports.updateUserByAdmin = joi.object({
  name: joi.string().optional(),
  email: joi.string().email().optional(),
  role: joi.string().valid(...Object.values(roles)).optional(),
  sellerInfo: sellerInfoSchema.optional(),
  notifications: notificationsSchema.optional(),
  privacySettings: privacySettingsSchema.optional(),
  accountPreferences: accountPreferencesSchema.optional(),
  savedAddresses: joi.array().items(addressSchema).optional(),
  profilePicture: joi.string().uri().optional(),
});
