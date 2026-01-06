const userService = require('./user.service');
const {
  successWithData,
  successWithDataAndToken,
  successWithMessage,
  customError,
} = require('../../services/response.service');

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

/**
 * Request password reset
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.requestPasswordReset(email);

    // Always return generic success message
    return successWithMessage(
      'If an account exists with this email, a password reset link has been sent.',
      res
    );
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Reset password with token
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token, password } = req.body;
    const data = await userService.resetPasswordWithToken(token, password);

    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get user profile
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getUserProfile = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const user = await userService.getUserById(user_id);

    if (!user) {
      return customError('User not found', res);
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    return successWithData(userResponse, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Update user profile
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.updateUserProfile = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const files = req.file ? [req.file] : null;
    console.log('body  ', req.body);

    const data = await userService.updateUserProfile(user_id, req.body, files);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Change user password
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.changePassword = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const { currentPassword, newPassword } = req.body;

    const data = await userService.changePassword(
      user_id,
      currentPassword,
      newPassword
    );
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Delete user account
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.deleteUser = async (req, res) => {
  try {
    const user_id = res.locals.user.id;
    const { password } = req.body;

    const data = await userService.deleteUser(user_id, password);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get all users (admin only)
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getAllUsers = async (req, res) => {
  try {
    const { page, limit, search, role } = req.query;

    const data = await userService.getAllUsers(
      parseInt(page) || 1,
      parseInt(limit) || 10,
      search || '',
      role || ''
    );

    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Update user role (admin only)
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const data = await userService.updateUserRole(id, role);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get user by ID (admin only)
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);
    if (!user) {
      return customError('User not found', res);
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    return successWithData(userResponse, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get all sellers
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getAllSellers = async (req, res) => {
  try {
    const data = await userService.getAllSellers();

    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Get seller data for shop by seller_id
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.getSellerDataForShop = async (req, res) => {
  try {
    const sellerId = req.params.id;

    const data = await userService.getSellerDataForShop(sellerId);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Delete user by admin (no password required)
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = res.locals.user.id;

    const data = await userService.deleteUserByAdmin(id, adminId);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};

/**
 * Update user by admin
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
module.exports.updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.file ? [req.file] : null;

    const data = await userService.updateUserByAdmin(id, req.body, files);
    return successWithData(data, res);
  } catch (error) {
    return customError(`${error.message}`, res);
  }
};
