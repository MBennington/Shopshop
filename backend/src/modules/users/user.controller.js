const userService = require('./user.service');
const {
    successWithData,
    successWithDataAndToken,
    customError,
  } = require("../../services/response.service");

/**
 * Create new user
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.createUser = async (req, res) => {
    try {
      const data = await userService.createUser(req.body);
      return successWithDataAndToken(data, res);
    } catch (error) {
      return customError(`${error.message}`, res);
    }
  };

/**
 * Login user
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.login = async (req, res) => {
  try {
    const data = await userService.login(req.body);
    return successWithDataAndToken(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};