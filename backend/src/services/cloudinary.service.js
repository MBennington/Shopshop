const cloudinary = require('../config/coudinary.config');
const fs = require('fs');

// Upload single file to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
    });

    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    // Clean up local file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
};

// Upload multiple files to Cloudinary
const uploadMultipleToCloudinary = async (files, folder = 'general') => {
  try {
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.path, folder)
    );
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error('Multiple file upload failed: ' + error.message);
  }
};

// Upload buffer to Cloudinary (for handling files from multer)
const uploadBufferToCloudinary = async (
  buffer,
  originalname,
  folder = 'general'
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          reject(new Error('Upload stream failed: ' + error.message));
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
};

// Delete from cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error('Cloudinary delete failed: ' + error.message);
  }
};

// Delete multiple files from cloudinary
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((publicId) =>
      deleteFromCloudinary(publicId)
    );
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    throw new Error('Multiple file deletion failed: ' + error.message);
  }
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
};
