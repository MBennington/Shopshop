const bcrypt = require('bcryptjs');
const UserModel = require('./user.model');
const repository = require('../../services/repository.service');
const {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require('../../services/cloudinary.service');
const extractPublicIdFromUrl = require('../../utils/extractPublicIdFromUrl.util');

/**
 * Process user data with profile picture upload
 * @param body
 * @param files
 * @param existingUser - Optional, for updates
 * @returns {Promise<*>}
 */
module.exports.processUserData = async (body, files, existingUser = null) => {
  console.log('Processing user data...');
  console.log('Files received:', files ? files.length : 'No files');

  const processedData = {
    name: body.name,
  };

  // Handle profile picture upload
  if (files && files.length > 0) {
    const profilePictureFile = files.find(
      (file) => file.fieldname === 'profilePicture'
    );

    if (profilePictureFile) {
      try {
        // Delete old profile picture if exists
        if (existingUser && existingUser.profilePicture) {
          const oldPublicId = extractPublicIdFromUrl(
            existingUser.profilePicture
          );
          if (oldPublicId) {
            await deleteFromCloudinary(oldPublicId);
            console.log('Deleted old profile picture:', oldPublicId);
          }
        }

        // Upload new profile picture
        const uploadResult = await uploadBufferToCloudinary(
          profilePictureFile.buffer,
          profilePictureFile.originalname,
          'profiles'
        );

        processedData.profilePicture = uploadResult.url;
        console.log('Uploaded new profile picture:', uploadResult.url);
      } catch (error) {
        console.error('Failed to upload profile picture:', error);
        throw new Error(`Failed to upload profile picture: ${error.message}`);
      }
    }
  }

  return processedData;
};

/**
 * Create new user
 * @param body
 * @returns {Promise<*>}
 */
module.exports.createUser = async (body) => {
  const { name, email, password, role, businessName, phone, businessType } =
    body;
  const existingUser = await this.getUserByEmail(email);

  if (existingUser) {
    throw new Error('Email already exists');
  }

  let user = new UserModel({
    name,
    email,
    password,
    role,
    sellerInfo: {
      businessName,
      phone,
      businessType,
    },
  });

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

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(body.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Password incorrect');
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
 * @param userId
 * @returns {Promise<*>}
 */
module.exports.getUserById = async (userId) => {
  const user = await repository.findOne(UserModel, {
    _id: userId,
  });

  return user;
};

/**
 * Update user profile
 * @param user_id
 * @param update_data
 * @returns {Promise<*>}
 */
module.exports.updateUserProfile = async (user_id, body, files) => {
  const existingUser = await this.getUserById(user_id);
  if (!existingUser) throw new Error('User not found');

  const processedData = await this.processUserData(body, files, existingUser);

  const updatedUser = await repository.updateOne(
    UserModel,
    { _id: user_id },
    processedData,
    { new: true }
  );

  if (!updatedUser) throw new Error('Failed to update user');

  const user = updatedUser.toObject();
  delete user.password;
  return user;
};

// module.exports.updateUserProfile = async (user_id, update_data) => {
//   const existingUser = await this.getUserById(user_id);
//   if (!existingUser) {
//     throw new Error('User not found');
//   }

//   // Update user
//   const updatedUser = await repository.findOneAndUpdate(
//     UserModel,
//     { _id: user_id },
//     update_data,
//     { new: true }
//   );

//   if (!updatedUser) {
//     throw new Error('Failed to update user');
//   }

//   const user = updatedUser.toObject();
//   delete user.password;

//   return user;
// };

/**
 * Update user profile with image upload
 * @param user_id
 * @param body
 * @param files
 * @returns {Promise<*>}
 */
// module.exports.updateUserProfileWithImage = async (user_id, body, files) => {
//   const existingUser = await this.getUserById(user_id);
//   if (!existingUser) {
//     throw new Error('User not found');
//   }

//   // Process user data with image upload
//   const processedData = await this.processUserData(body, files, existingUser);

//   // Update user
//   const updatedUser = await repository.findOneAndUpdate(
//     UserModel,
//     { _id: user_id },
//     processedData,
//     { new: true }
//   );

//   if (!updatedUser) {
//     throw new Error('Failed to update user');
//   }

//   const user = updatedUser.toObject();
//   delete user.password;

//   return user;
// };

/**
 * Change user password
 * @param userId
 * @param currentPassword
 * @param newPassword
 * @returns {Promise<*>}
 */
module.exports.changePassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  // Get user with password
  const user = await repository.findOne(UserModel, { _id: userId });
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );
  if (!isCurrentPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  const updatedUser = await repository.findOneAndUpdate(
    UserModel,
    { _id: userId },
    { password: hashedNewPassword },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error('Failed to update password');
  }

  const userResponse = updatedUser.toObject();
  delete userResponse.password;

  return userResponse;
};

/**
 * Update user role (admin only)
 * @param userId
 * @param newRole
 * @returns {Promise<*>}
 */
module.exports.updateUserRole = async (userId, newRole) => {
  // Check if user exists
  const existingUser = await this.getUserById(userId);
  if (!existingUser) {
    throw new Error('User not found');
  }

  // Update role
  const updatedUser = await repository.findOneAndUpdate(
    UserModel,
    { _id: userId },
    { role: newRole },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error('Failed to update user role');
  }

  const user = updatedUser.toObject();
  delete user.password;

  return user;
};

/**
 * Delete user account
 * @param user_id
 * @param password
 * @returns {Promise<*>}
 */
module.exports.deleteUser = async (user_id, password) => {
  // Get user with password
  const user = await repository.findOne(UserModel, { _id: user_id });
  if (!user) {
    throw new Error('User not found');
  }

  // Verify password before deletion
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Password is incorrect');
  }

  // Delete profile picture from Cloudinary if exists
  if (user.profilePicture) {
    try {
      const publicId = extractPublicIdFromUrl(user.profilePicture);
      if (publicId) {
        await deleteFromCloudinary(publicId);
        console.log('Deleted profile picture:', publicId);
      }
    } catch (error) {
      console.error('Failed to delete profile picture:', error);
      // Don't throw error for deletion failures
    }
  }

  // Delete user
  const deletedUser = await repository.findOneAndDelete(UserModel, {
    _id: user_id,
  });
  if (!deletedUser) {
    throw new Error('Failed to delete user');
  }

  const userResponse = deletedUser.toObject();
  delete userResponse.password;

  return userResponse;
};

/**
 * Get all users (admin only)
 * @param page
 * @param limit
 * @param search
 * @returns {Promise<*>}
 */
module.exports.getAllUsers = async (page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;

  let query = {};
  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
      ],
    };
  }

  const users = await repository.find(UserModel, query, {
    skip,
    limit,
    sort: { created_at: -1 },
  });

  const total = await repository.count(UserModel, query);

  // Remove passwords from response
  const usersWithoutPassword = users.map((user) => {
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  });

  return {
    users: usersWithoutPassword,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
