const formidable = require("formidable");

//const imageConfig = require("../config/image.config");
const response = require('./response.service');
const tokenService = require('./token.service');

/**
 * Get token from header
 * @param req
 * @returns {*}
 */
module.exports.getTokenFromHeader = (req) => {
  if (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token')
    || (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

/**
 * Validate user role with array of granted roles
 * @param role
 * @param grantedUserRoles
 * @returns {string}
 */
const validateUserRole = (role, grantedUserRoles) => {
  if (
    Array.isArray(grantedUserRoles)
    && grantedUserRoles.length !== 0
    && grantedUserRoles.includes(role)
  ) {
    return 'Granted';
  } else {
    throw new Error('Unauthorized to this route.');
  }
};

/**
 * Get user by token
 * @param req
 */
module.exports.getUserFromRequest = (req) => {
  const jwt = this.getTokenFromHeader(req);
  const tokenDetails = tokenService.verifyJwt(jwt);

  if (tokenDetails) {
    return tokenDetails;
  }

  throw new Error('Invalid user');
};

/**
 * Validate API request header
 * @returns {Function}
 */
module.exports.validateHeader = (grantedUserRoles) => async (req, res, next) => {
  try {
    const jwt = this.getTokenFromHeader(req);
    res.locals.user = tokenService.verifyJwt(jwt);

    if (grantedUserRoles) {
      validateUserRole(res.locals.user.role, grantedUserRoles);
    }

    next();
  } catch (error) {
    return response.customError(`${error}`, res);
  }
};

/**
 * Validate header with user
 * @returns {Function}
 */

class TokenExpiredError extends Error {
  constructor(message) {
    super(message); 
    this.name = "TokenExpiredError"; 
  }
}

/**
 * Validate API request body according to the defined schema
 * @param schema
 * @returns {Function}
 */
module.exports.validateBody = function (schema) {
  return (req, res, next) => {
    const result = schema.validate(req.body);

    if (result.error) {
      return response.customError(result.error.details[0].message, res);
    }
    next();
  };
};

/**
 * Validate query parameters in the API request
 * @param schema
 * @returns {Function}
 */
module.exports.validateQueryParameters = function (schema) {
  return (req, res, next) => {
    const result = schema.validate(req.query);
    if (result.error) {
      return response.customError(result.error.details[0].message, res);
    }

    next();
  };
};

/**
 * Validate route parameters
 * @param schema
 * @returns {function(...[*]=)}
 */
module.exports.validateRouteParameters = function (schema) {
  return (req, res, next) => {
    const result = schema.validate(req.params);
    if (result.error) {
      return response.customError(result.error.details[0].message, res);
    }

    next();
  };
};

/**
 * Validate API request body according to the defined schema
 * @param schema
 * @returns {Function}
 */
// module.exports.validateMultipartFormData = (schema) => async (req, res, next) => {
//   const form = formidable({
//     uploadDir: imageConfig.imageSavePath,
//     keepExtensions: true,
//     maxFileSize: imageConfig.maxFileSize,
//     multiples: true,
//   });

//   const formFields = await new Promise((resolve, reject) => {
//     form.parse(req, (err, fields, files) => {
//       if (err) {
//         reject(err);
//         return response.customError(`${err}`, res);
//       }

//       resolve({ fields, files });
//     });
//   });

//   const data = {
//     ...formFields.fields,
//     ...formFields.files,
//   };

//   for (const key in data) {
//     if ({}.hasOwnProperty.call(data, key)) {
//       try {
//         // Convert strings to Json objects
//         data[key] = JSON.parse(data[key]);
//       }
//       catch (e) {
//         // continue regardless of error
//       }
//     }
//   }

//   // Convert to array
//   if (!Array.isArray(data.files)) {
//     data.files = [data.files];
//   }

//   // Validate form fields
//   const result = schema.validate(data);

//   if (result.error) {
//     return response.customError(result.error.details[0].message, res);
//   }

//   // Assign values to request body
//   req.body = data;
//   next();
// };