const ProductModel = require('./product.model');
const userService = require('../users/user.service');
const { roles } = require('../../config/role.config');
const repository = require('../../services/repository.service');
const mongoose = require('mongoose');

/**
 * Create new product
 * @param body
 * @returns {Promise<*>}
 */
module.exports.createProduct = async (body, user_id) => {
  const user = await userService.getUserById(user_id);

  if (!user) {
    throw new Error('User not found.');
  }
  if (user.role !== roles.seller) {
    throw new Error(
      'Only sellers are allowed to add products. Please log in with a seller account.'
    );
  }

  const processedData = {
    name: body.name,
    category: body.category,
    price: Number(body.price),
    description: body.description,
    hasSizes: body.hasSizes === 'true' || body.hasSizes === true,
    colors: [],
  };

  if (body.colors && Array.isArray(body.colors)) {
    body.colors.forEach((colorData, index) => {
      const color = {
        colorCode: colorData.colorCode,
        colorName: colorData.colorName,
        images: [],
        sizes: [],
        quantity: 0,
      };

      console.log(`Processing color ${index}:`, colorData);

      if (processedData.hasSizes) {
        if (colorData.sizes && Array.isArray(colorData.sizes)) {
          color.sizes = colorData.sizes.map((sizeData) => ({
            size: sizeData.size,
            quantity: Number(sizeData.quantity),
          }));
        }
      } else {
        color.quantity = Number(colorData.quantity || 0);
      }

      processedData.colors.push(color);
    });
  }

  // Create new product
  let product = new ProductModel({
    ...processedData,
    seller: user._id,
  });
  await repository.save(product);

  product = product.toObject();

  return product;
};

/**
 * Calculate total inventory for a product
 * @param product
 * @returns {number}
 */
module.exports.calculateTotalInventory = (product) => {
  if (!product.colors || product.colors.length === 0) {
    return 0;
  }

  return product.colors.reduce((total, color) => {
    if (product.hasSizes) {
      // Sum quantities from all sizes
      return (
        total +
        color.sizes.reduce((colorTotal, size) => colorTotal + size.quantity, 0)
      );
    } else {
      // Use simple quantity
      return total + (color.quantity || 0);
    }
  }, 0);
};

/**
 * Get products with inventory information
 * @param filter
 * @returns {Promise<*>}
 */
module.exports.getProductsWithInventory = async (filter = {}) => {
  const products = await repository.find(ProductModel, filter);

  return products.map((product) => {
    const productObj = product.toObject();
    productObj.totalInventory =
      module.exports.calculateTotalInventory(productObj);
    return productObj;
  });
};

/**
 * Get all products by seller
 * @param sellerId
 * @returns {Promise<*>}
 */
module.exports.getProductsBySeller = async (seller_id) => {
  const products = await repository.findMany(ProductModel, {
    seller: seller_id,
  });

  return products.map((product) => {
    const productObj = product.toObject();
    productObj.totalInventory =
      module.exports.calculateTotalInventory(productObj);
    return productObj;
  });
};

/**
 * Update product
 * @param body
 * @param product_id
 * @param user_id
 * @returns {Promise<*>}
 */
module.exports.updateProduct = async (body, product_id, user_id) => {
  const user = await userService.getUserById(user_id);

  if (!user) {
    throw new Error('User not found.');
  }
  if (user.role !== roles.seller) {
    throw new Error(
      'Only sellers are allowed to update products. Please log in with a seller account.'
    );
  }

  let existingProduct = await this.getProductById(product_id);

  if (!existingProduct) {
    throw new Error('Product not found');
  }

  // Check if the product belongs to the user
  if (existingProduct.seller.toString() !== user._id.toString()) {
    throw new Error('You can only update your own products');
  }

  const processedData = {};

  // Only include fields that are provided in the request
  if (body.name !== undefined) processedData.name = body.name;
  if (body.category !== undefined) processedData.category = body.category;
  if (body.price !== undefined) processedData.price = Number(body.price);
  if (body.description !== undefined)
    processedData.description = body.description;
  if (body.hasSizes !== undefined)
    processedData.hasSizes = body.hasSizes === 'true' || body.hasSizes === true;

  // Handle colors if provided
  if (body.colors && Array.isArray(body.colors)) {
    processedData.colors = [];
    body.colors.forEach((colorData, index) => {
      const color = {
        colorCode: colorData.colorCode,
        colorName: colorData.colorName,
        images: existingProduct.colors?.[index]?.images || [], // Keep existing images
        sizes: [],
        quantity: 0,
      };

      if (
        processedData.hasSizes !== undefined
          ? processedData.hasSizes
          : existingProduct.hasSizes
      ) {
        if (colorData.sizes && Array.isArray(colorData.sizes)) {
          color.sizes = colorData.sizes.map((sizeData) => ({
            size: sizeData.size,
            quantity: Number(sizeData.quantity),
          }));
        }
      } else {
        color.quantity = Number(colorData.quantity || 0);
      }

      processedData.colors.push(color);
    });
  }

  const updatedProduct = await repository.updateOne(
    ProductModel,
    {
      _id: new mongoose.Types.ObjectId(product_id),
    },
    processedData,
    {
      new: true,
    }
  );

  return updatedProduct;
};

/**
 * Get product by id
 * @param id
 * @returns {Promise<*>}
 */
module.exports.getProductById = async (product_id) => {
  return repository.findOne(ProductModel, {
    _id: new mongoose.Types.ObjectId(product_id),
  });
};

/**
 * Soft delete a product (change status to inactive)
 * @param product_id
 * @param user_id
 * @returns {Promise<*>}
 */
module.exports.deleteProduct = async (product_id, user_id) => {
  const user = await userService.getUserById(user_id);

  if (!user) {
    throw new Error('User not found.');
  }
  if (user.role !== roles.seller) {
    throw new Error(
      'Only sellers are allowed to deactivate products. Please log in with a seller account.'
    );
  }

  const existingProduct = await this.getProductById(product_id);
  if (!existingProduct) {
    throw new Error('Product not found');
  }

  // Check if the product belongs to the user
  if (existingProduct.seller.toString() !== user._id.toString()) {
    throw new Error('You can only deactivate your own products');
  }

  // Toggle product isActive status
  const updatedProduct = await repository.updateOne(
    ProductModel,
    {
      _id: new mongoose.Types.ObjectId(product_id),
    },
    { isActive: !existingProduct.isActive },
    {
      new: true,
    }
  );

  return updatedProduct;
};
