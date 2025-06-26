const bcrypt = require('bcryptjs');
const UserModel = require("./user.model");
const repository = require("../../services/repository.service");

/**
 * Create new user
 * @param body
 * @returns {Promise<*>}
 */
module.exports.createUser = async (body) => {
  const existingUser = await this.getUserByEmail(body.email);

  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Create new user
  let user = new UserModel(body);
  await repository.save(user);

  user = user.toObject();
  delete user.password;

  return user;
};

/**
 * Login user
 * @param body
 * @returns {Promise<*>}
 */
module.exports.login = async (body) => {
  let user = await this.getUserByEmail(body.email);

  if(!user){
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(body.password, user.password);
  if (!isPasswordValid) {
    throw new Error("Password incorrect");
  }

  user = user.toObject();
  delete user.password;
  
  return user;
};

/**
 * Get user by email
 * @param email
 * @returns {Promise<*>}
 */
module.exports.getUserByEmail = async (email) => {
  const user = await repository.findOne(UserModel, {
    email: email,
  });

  return user;
};

/**
 * Get user by Id
 * @param email
 * @returns {Promise<*>}
 */
module.exports.getUserById = async (userId) => {
  const user = await repository.findOne(UserModel, {
    _id: userId,
  });

  return user;
};