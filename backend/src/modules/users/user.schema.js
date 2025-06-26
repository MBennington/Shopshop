const joi = require("joi");

const passwordValidation = joi.string().min(8).regex(/^\S+$/).required().messages({
  "string.min": "Password must be at least 8 characters long",
  "string.pattern.base": "Password must not contain spaces",
});

module.exports.createUser = joi.object().keys({
  name: joi.string().trim().min(1).required(),
  email: joi
    .string()
    .email({ tlds: { allow: false } })
    .required(),
  password: passwordValidation,
});

module.exports.login = joi.object().keys({
  email: joi
    .string()
    .email({ tlds: { allow: false } })
    .required(),
  password: passwordValidation,
});
