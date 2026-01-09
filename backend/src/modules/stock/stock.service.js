const StockModel = require('./stock.model');
const ProductModel = require('../products/product.model');
const repository = require('../../services/repository.service');
const mongoose = require('mongoose');

/**
 * Helper function to initialize color data structures
 * @param {Object} color - Color object from product
 * @param {Boolean} productHasSizes - Whether product has sizes
 * @param {Boolean} useQuantity - Whether to use quantity from product
 * @returns {Object} - Initialized color data
 */
const initializeColorData = (color, productHasSizes, useQuantity = false) => {
  const colorData = {
    colorCode: color.colorCode,
    colorName: color.colorName,
  };

  if (productHasSizes && color.sizes && color.sizes.length > 0) {
    // Product with sizes
    colorData.sizes = color.sizes.map((size) => ({
      size: size.size,
      salesCount: 0,
      initialStock: useQuantity ? size.quantity || 0 : 0,
      availableStock: useQuantity ? size.quantity || 0 : 0,
      reservedStock: 0,
    }));
  } else {
    // Product without sizes
    colorData.salesCount = 0;
    colorData.initialStock = useQuantity ? color.quantity || 0 : 0;
    colorData.availableStock = useQuantity ? color.quantity || 0 : 0;
    colorData.reservedStock = 0;
  }

  return colorData;
};

/**
 * Create or get stock record for a product
 * @param {String} product_id - Product ID
 * @param {String} seller_id - Seller ID
 * @returns {Promise<Object>}
 */
module.exports.createOrGetStock = async (product_id, seller_id) => {
  let stock = await repository.findOne(StockModel, { product_id });

  if (!stock) {
    // Get product to initialize stock structure
    const product = await repository.findOne(ProductModel, { _id: product_id });
    if (!product) {
      throw new Error('Product not found');
    }

    // Use product's seller_id to ensure consistency
    const productSellerId = product.seller || seller_id;

    // Initialize all nested structures based on product colors
    const salesCountByColor = product.colors.map((color) => {
      const colorData = initializeColorData(color, product.hasSizes, false);
      // Remove inventory fields from salesCountByColor
      if (product.hasSizes && color.sizes && color.sizes.length > 0) {
        colorData.sizes = colorData.sizes.map((s) => ({
          size: s.size,
          salesCount: s.salesCount,
        }));
      } else {
        delete colorData.initialStock;
        delete colorData.availableStock;
        delete colorData.reservedStock;
      }
      return colorData;
    });

    const initialStockByColor = product.colors.map((color) => {
      const colorData = initializeColorData(color, product.hasSizes, true);
      // Keep only initial stock fields
      if (product.hasSizes && color.sizes && color.sizes.length > 0) {
        colorData.sizes = colorData.sizes.map((s) => ({
          size: s.size,
          initialStock: s.initialStock,
        }));
      } else {
        delete colorData.salesCount;
        delete colorData.availableStock;
        delete colorData.reservedStock;
      }
      return colorData;
    });

    const availableStockByColor = product.colors.map((color) => {
      const colorData = initializeColorData(color, product.hasSizes, true);
      // Keep only available stock fields
      if (product.hasSizes && color.sizes && color.sizes.length > 0) {
        colorData.sizes = colorData.sizes.map((s) => ({
          size: s.size,
          availableStock: s.availableStock,
        }));
      } else {
        delete colorData.salesCount;
        delete colorData.initialStock;
        delete colorData.reservedStock;
      }
      return colorData;
    });

    const reservedStockByColor = product.colors.map((color) => {
      const colorData = initializeColorData(color, product.hasSizes, false);
      // Keep only reserved stock fields
      if (product.hasSizes && color.sizes && color.sizes.length > 0) {
        colorData.sizes = colorData.sizes.map((s) => ({
          size: s.size,
          reservedStock: s.reservedStock,
        }));
      } else {
        delete colorData.salesCount;
        delete colorData.initialStock;
        delete colorData.availableStock;
      }
      return colorData;
    });

    stock = new StockModel({
      product_id,
      seller_id: productSellerId,
      sales_count: 0,
      salesCountByColor,
      total_earnings: 0,
      initial_stock_by_color: initialStockByColor,
      available_stock_by_color: availableStockByColor,
      reserved_stock_by_color: reservedStockByColor,
      restock_history: [],
      last_restocked_date: null,
    });

    stock = await repository.save(stock);
  }

  return stock ? stock.toObject() : null;
};

/**
 * Get stock by product ID
 * @param {String} product_id - Product ID
 * @returns {Promise<Object>}
 */
module.exports.getStockByProduct = async (product_id) => {
  const stock = await StockModel.findOne({ product_id })
    .populate('product_id', 'name price category')
    .populate('seller_id', 'name businessName')
    .lean();

  if (!stock) {
    throw new Error('Stock record not found for this product');
  }

  return stock;
};

/**
 * Get stock records by seller
 * @param {String} seller_id - Seller ID
 * @param {Object} queryParams - Query parameters (page, limit)
 * @returns {Promise<Object>}
 */
module.exports.getStockBySeller = async (seller_id, queryParams = {}) => {
  const { page = 1, limit = 20 } = queryParams;
  const skip = (page - 1) * limit;

  const filter = { seller_id };

  const stocks = await StockModel.find(filter)
    .populate('product_id', 'name price category isActive')
    .sort({ sales_count: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await StockModel.countDocuments(filter);

  return {
    stocks,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Increment sales count and earnings
 * @param {String} product_id - Product ID
 * @param {String} colorCode - Color code
 * @param {String} size - Size (optional)
 * @param {Number} quantity - Quantity sold
 * @param {Number} price - Price per unit
 * @returns {Promise<Object>}
 */
module.exports.incrementSales = async (
  product_id,
  colorCode,
  size,
  quantity,
  price
) => {
  // Get or create stock record
  const product = await repository.findOne(ProductModel, { _id: product_id });
  if (!product) {
    throw new Error('Product not found');
  }

  let stock = await repository.findOne(StockModel, { product_id });

  if (!stock) {
    // Create stock record if it doesn't exist
    const productSellerId = product.seller;
    
    const salesCountByColor = product.colors.map((color) => {
      const colorData = initializeColorData(color, product.hasSizes, false);
      if (product.hasSizes && color.sizes && color.sizes.length > 0) {
        colorData.sizes = colorData.sizes.map((s) => ({
          size: s.size,
          salesCount: s.salesCount,
        }));
      } else {
        delete colorData.initialStock;
        delete colorData.availableStock;
        delete colorData.reservedStock;
      }
      return colorData;
    });

    const initialStockByColor = product.colors.map((color) => {
      const colorData = initializeColorData(color, product.hasSizes, true);
      if (product.hasSizes && color.sizes && color.sizes.length > 0) {
        colorData.sizes = colorData.sizes.map((s) => ({
          size: s.size,
          initialStock: s.initialStock,
        }));
      } else {
        delete colorData.salesCount;
        delete colorData.availableStock;
        delete colorData.reservedStock;
      }
      return colorData;
    });

    const availableStockByColor = product.colors.map((color) => {
      const colorData = initializeColorData(color, product.hasSizes, true);
      if (product.hasSizes && color.sizes && color.sizes.length > 0) {
        colorData.sizes = colorData.sizes.map((s) => ({
          size: s.size,
          availableStock: s.availableStock,
        }));
      } else {
        delete colorData.salesCount;
        delete colorData.initialStock;
        delete colorData.reservedStock;
      }
      return colorData;
    });

    const reservedStockByColor = product.colors.map((color) => {
      const colorData = initializeColorData(color, product.hasSizes, false);
      if (product.hasSizes && color.sizes && color.sizes.length > 0) {
        colorData.sizes = colorData.sizes.map((s) => ({
          size: s.size,
          reservedStock: s.reservedStock,
        }));
      } else {
        delete colorData.salesCount;
        delete colorData.initialStock;
        delete colorData.availableStock;
      }
      return colorData;
    });

    stock = new StockModel({
      product_id,
      seller_id: productSellerId,
      sales_count: 0,
      salesCountByColor,
      total_earnings: 0,
      initial_stock_by_color: initialStockByColor,
      available_stock_by_color: availableStockByColor,
      reserved_stock_by_color: reservedStockByColor,
      restock_history: [],
      last_restocked_date: null,
    });
    stock = await repository.save(stock);
  }

  // Update sales count
  stock.sales_count += quantity;

  // Update total earnings
  stock.total_earnings += price * quantity;

  // Update sales count by color
  const colorIndex = stock.salesCountByColor.findIndex(
    (c) => c.colorCode === colorCode
  );

  if (colorIndex === -1) {
    throw new Error('Color not found in stock record');
  }

  const colorData = stock.salesCountByColor[colorIndex];

  if (product.hasSizes && size) {
    // Update size-specific sales count
    const sizeIndex = colorData.sizes
      ? colorData.sizes.findIndex((s) => s.size === size)
      : -1;

    if (sizeIndex === -1) {
      throw new Error('Size not found in stock record');
    }

    colorData.sizes[sizeIndex].salesCount += quantity;
  } else {
    // Update color sales count (no sizes)
    colorData.salesCount += quantity;
  }

  stock.markModified('salesCountByColor');
  const updatedStock = await repository.save(stock);

  return updatedStock ? updatedStock.toObject() : null;
};

/**
 * Update stock record
 * @param {String} product_id - Product ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>}
 */
module.exports.updateStock = async (product_id, updateData) => {
  const stock = await repository.findOne(StockModel, { product_id });

  if (!stock) {
    throw new Error('Stock record not found');
  }

  if (updateData.sales_count !== undefined) {
    stock.sales_count = updateData.sales_count;
  }

  if (updateData.total_earnings !== undefined) {
    stock.total_earnings = updateData.total_earnings;
  }

  if (updateData.salesCountByColor) {
    stock.salesCountByColor = updateData.salesCountByColor;
    stock.markModified('salesCountByColor');
  }

  if (updateData.initial_stock_by_color) {
    stock.initial_stock_by_color = updateData.initial_stock_by_color;
    stock.markModified('initial_stock_by_color');
  }

  if (updateData.available_stock_by_color) {
    stock.available_stock_by_color = updateData.available_stock_by_color;
    stock.markModified('available_stock_by_color');
  }

  if (updateData.reserved_stock_by_color) {
    stock.reserved_stock_by_color = updateData.reserved_stock_by_color;
    stock.markModified('reserved_stock_by_color');
  }

  if (updateData.restock_history !== undefined) {
    stock.restock_history = updateData.restock_history;
    stock.markModified('restock_history');
  }

  if (updateData.last_restocked_date !== undefined) {
    stock.last_restocked_date = updateData.last_restocked_date;
  }

  const updatedStock = await repository.save(stock);
  return updatedStock ? updatedStock.toObject() : null;
};

/**
 * Get all stock records (admin only)
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
module.exports.getAllStocks = async (queryParams = {}) => {
  const { page = 1, limit = 20, seller_id, sortBy = 'sales_count' } =
    queryParams;
  const skip = (page - 1) * limit;

  const filter = {};
  if (seller_id) {
    filter.seller_id = seller_id;
  }

  const sortOptions = {};
  if (sortBy === 'sales_count') {
    sortOptions.sales_count = -1;
  } else if (sortBy === 'total_earnings') {
    sortOptions.total_earnings = -1;
  } else {
    sortOptions.created_at = -1;
  }

  const stocks = await StockModel.find(filter)
    .populate('product_id', 'name price category')
    .populate('seller_id', 'name businessName')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await StockModel.countDocuments(filter);

  return {
    stocks,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Restock a product variant
 * @param {String} product_id - Product ID
 * @param {String} colorCode - Color code
 * @param {String} size - Size (optional)
 * @param {Number} quantity - Quantity to add
 * @param {String} notes - Optional notes
 * @returns {Promise<Object>}
 */
module.exports.restockProduct = async (
  product_id,
  colorCode,
  size,
  quantity,
  notes = null
) => {
  // Get or create stock record
  const product = await repository.findOne(ProductModel, { _id: product_id });
  if (!product) {
    throw new Error('Product not found');
  }

  let stock = await repository.findOne(StockModel, { product_id });

  if (!stock) {
    // Create stock record if it doesn't exist
    stock = await module.exports.createOrGetStock(product_id, product.seller);
    stock = await repository.findOne(StockModel, { product_id });
  }

  // Find color in stock record
  const colorIndex = stock.initial_stock_by_color.findIndex(
    (c) => c.colorCode === colorCode
  );

  if (colorIndex === -1) {
    throw new Error('Color not found in stock record');
  }

  const colorData = stock.initial_stock_by_color[colorIndex];
  const availableColorData = stock.available_stock_by_color[colorIndex];

  if (product.hasSizes && size) {
    // Update size-specific stock
    const sizeIndex = colorData.sizes
      ? colorData.sizes.findIndex((s) => s.size === size)
      : -1;

    if (sizeIndex === -1) {
      throw new Error('Size not found in stock record');
    }

    // Update initial stock
    colorData.sizes[sizeIndex].initialStock += quantity;
    // Update available stock
    availableColorData.sizes[sizeIndex].availableStock += quantity;
  } else {
    // Update color stock (no sizes)
    colorData.initialStock += quantity;
    availableColorData.availableStock += quantity;
  }

  // Add to restock history
  stock.restock_history.push({
    date: new Date(),
    quantity,
    colorCode,
    size: size || null,
    notes: notes || null,
  });

  // Update last restocked date
  stock.last_restocked_date = new Date();

  stock.markModified('initial_stock_by_color');
  stock.markModified('available_stock_by_color');
  stock.markModified('restock_history');

  const updatedStock = await repository.save(stock);
  return updatedStock ? updatedStock.toObject() : null;
};

/**
 * Get available stock for a product variant from stock module
 * @param {String} product_id - Product ID
 * @param {String} colorCode - Color code
 * @param {String} size - Size (optional)
 * @returns {Promise<Number>}
 */
module.exports.getAvailableStock = async (product_id, colorCode, size = null) => {
  let stock = await repository.findOne(StockModel, { product_id });

  if (!stock) {
    // If stock record doesn't exist, create it
    const product = await repository.findOne(ProductModel, { _id: product_id });
    if (!product) {
      return 0;
    }
    stock = await module.exports.createOrGetStock(product_id, product.seller);
    stock = await repository.findOne(StockModel, { product_id });
  }

  if (!stock) return 0;

  const colorIndex = stock.available_stock_by_color.findIndex(
    (c) => c.colorCode === colorCode
  );

  if (colorIndex === -1) return 0;

  const colorData = stock.available_stock_by_color[colorIndex];

  if (size) {
    const sizeData = colorData.sizes?.find((s) => s.size === size);
    return sizeData ? sizeData.availableStock : 0;
  } else {
    return colorData.availableStock || 0;
  }
};

/**
 * Get reserved stock for a product variant from stock module
 * @param {String} product_id - Product ID
 * @param {String} colorCode - Color code
 * @param {String} size - Size (optional)
 * @returns {Promise<Number>}
 */
module.exports.getReservedStock = async (product_id, colorCode, size = null) => {
  let stock = await repository.findOne(StockModel, { product_id });

  if (!stock) return 0;

  const colorIndex = stock.reserved_stock_by_color.findIndex(
    (c) => c.colorCode === colorCode
  );

  if (colorIndex === -1) return 0;

  const colorData = stock.reserved_stock_by_color[colorIndex];

  if (size) {
    const sizeData = colorData.sizes?.find((s) => s.size === size);
    return sizeData ? sizeData.reservedStock : 0;
  } else {
    return colorData.reservedStock || 0;
  }
};

/**
 * Get sold stock for a product variant from stock module
 * @param {String} product_id - Product ID
 * @param {String} colorCode - Color code
 * @param {String} size - Size (optional)
 * @returns {Promise<Number>}
 */
module.exports.getSoldStock = async (product_id, colorCode, size = null) => {
  let stock = await repository.findOne(StockModel, { product_id });

  if (!stock) return 0;

  const colorIndex = stock.salesCountByColor.findIndex(
    (c) => c.colorCode === colorCode
  );

  if (colorIndex === -1) return 0;

  const colorData = stock.salesCountByColor[colorIndex];

  if (size) {
    const sizeData = colorData.sizes?.find((s) => s.size === size);
    return sizeData ? sizeData.salesCount : 0;
  } else {
    return colorData.salesCount || 0;
  }
};

/**
 * Validate stock availability for order items using stock module
 * @param {Array} productsList - Array of { product_id, qty, color, size }
 * @returns {Promise<Object>} - { isValid: boolean, errors: Array }
 */
module.exports.validateStockAvailability = async (productsList) => {
  const errors = [];

  for (const item of productsList) {
    const product = await repository.findOne(ProductModel, {
      _id: new mongoose.Types.ObjectId(item.product_id),
    });

    if (!product) {
      errors.push(`Product ${item.product_id} not found`);
      continue;
    }

    // Get color code from color (could be colorCode or colorName)
    const colorData = product.colors.find(
      (c) => c.colorCode === item.color || c.colorName === item.color
    );

    if (!colorData) {
      errors.push(`Color ${item.color} not found in product ${item.product_id}`);
      continue;
    }

    const colorCode = colorData.colorCode;
    const availableStock = await module.exports.getAvailableStock(
      item.product_id,
      colorCode,
      item.size || null
    );

    if (availableStock < item.qty) {
      const productName = product.name || 'Product';
      const variant = item.size
        ? `${item.color} - Size ${item.size}`
        : item.color;
      errors.push(
        `Insufficient stock for ${productName} (${variant}). Available: ${availableStock}, Requested: ${item.qty}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Reserve stock for a sub-order
 * @param {String} subOrderId - Sub-order ID
 * @param {Array} productsList - Array of { product_id, qty, color, size }
 * @returns {Promise<void>}
 */
module.exports.reserveStockForSubOrder = async (subOrderId, productsList) => {
  for (const item of productsList) {
    const product = await repository.findOne(ProductModel, {
      _id: new mongoose.Types.ObjectId(item.product_id),
    });

    if (!product) {
      console.error(`Product ${item.product_id} not found for stock reservation`);
      continue;
    }

    // Get or create stock record
    let stock = await repository.findOne(StockModel, { product_id: item.product_id });

    if (!stock) {
      stock = await module.exports.createOrGetStock(item.product_id, product.seller);
      stock = await repository.findOne(StockModel, { product_id: item.product_id });
    }

    // Find color code
    const colorData = product.colors.find(
      (c) => c.colorCode === item.color || c.colorName === item.color
    );

    if (!colorData) {
      console.error(`Color ${item.color} not found in product ${item.product_id}`);
      continue;
    }

    const colorCode = colorData.colorCode;
    const colorIndex = stock.reserved_stock_by_color.findIndex(
      (c) => c.colorCode === colorCode
    );

    if (colorIndex === -1) {
      console.error(`Color ${colorCode} not found in stock record for product ${item.product_id}`);
      continue;
    }

    const reservedColorData = stock.reserved_stock_by_color[colorIndex];
    const availableColorData = stock.available_stock_by_color[colorIndex];

    if (product.hasSizes && item.size) {
      // Product with sizes
      const sizeIndex = reservedColorData.sizes
        ? reservedColorData.sizes.findIndex((s) => s.size === item.size)
        : -1;

      if (sizeIndex === -1) {
        console.error(`Size ${item.size} not found in stock record for product ${item.product_id}`);
        continue;
      }

      // Increase reserved stock
      reservedColorData.sizes[sizeIndex].reservedStock += item.qty;
      // Decrease available stock
      availableColorData.sizes[sizeIndex].availableStock = Math.max(
        0,
        availableColorData.sizes[sizeIndex].availableStock - item.qty
      );
    } else {
      // Product without sizes
      reservedColorData.reservedStock += item.qty;
      availableColorData.availableStock = Math.max(
        0,
        availableColorData.availableStock - item.qty
      );
    }

    stock.markModified('reserved_stock_by_color');
    stock.markModified('available_stock_by_color');
    await repository.save(stock);
  }
};

/**
 * Convert reserved stock to sold for a sub-order
 * @param {String} subOrderId - Sub-order ID
 * @returns {Promise<void>}
 */
module.exports.convertReservedToSoldForSubOrder = async (subOrderId) => {
  const SubOrderModel = require('../subOrder/suborder.model');
  const subOrder = await repository.findOne(SubOrderModel, {
    _id: new mongoose.Types.ObjectId(subOrderId),
  });

  if (!subOrder || !subOrder.products_list) {
    return;
  }

  for (const item of subOrder.products_list) {
    const product = await repository.findOne(ProductModel, {
      _id: new mongoose.Types.ObjectId(item.product_id),
    });

    if (!product) {
      console.error(`Product ${item.product_id} not found for stock conversion`);
      continue;
    }

    // Get stock record
    let stock = await repository.findOne(StockModel, { product_id: item.product_id });

    if (!stock) {
      console.error(`Stock record not found for product ${item.product_id}`);
      continue;
    }

    // Find color code
    const colorData = product.colors.find(
      (c) => c.colorCode === item.color || c.colorName === item.color
    );

    if (!colorData) {
      console.error(`Color ${item.color} not found in product ${item.product_id}`);
      continue;
    }

    const colorCode = colorData.colorCode;
    const price = product.price;

    // Update sales count and earnings using incrementSales
    await module.exports.incrementSales(
      item.product_id,
      colorCode,
      item.size || null,
      item.qty,
      price
    );

    // Get updated stock
    stock = await repository.findOne(StockModel, { product_id: item.product_id });

    // Decrease reserved stock
    const reservedColorIndex = stock.reserved_stock_by_color.findIndex(
      (c) => c.colorCode === colorCode
    );

    if (reservedColorIndex !== -1) {
      const reservedColorData = stock.reserved_stock_by_color[reservedColorIndex];

      if (product.hasSizes && item.size) {
        const sizeIndex = reservedColorData.sizes
          ? reservedColorData.sizes.findIndex((s) => s.size === item.size)
          : -1;

        if (sizeIndex !== -1) {
          reservedColorData.sizes[sizeIndex].reservedStock = Math.max(
            0,
            reservedColorData.sizes[sizeIndex].reservedStock - item.qty
          );
        }
      } else {
        reservedColorData.reservedStock = Math.max(
          0,
          reservedColorData.reservedStock - item.qty
        );
      }

      stock.markModified('reserved_stock_by_color');
      await repository.save(stock);
    }
  }
};

/**
 * Release reserved stock for a sub-order
 * @param {String} subOrderId - Sub-order ID
 * @returns {Promise<void>}
 */
module.exports.releaseReservedStockForSubOrder = async (subOrderId) => {
  const SubOrderModel = require('../subOrder/suborder.model');
  const subOrder = await repository.findOne(SubOrderModel, {
    _id: new mongoose.Types.ObjectId(subOrderId),
  });

  if (!subOrder || !subOrder.products_list) {
    return;
  }

  for (const item of subOrder.products_list) {
    const product = await repository.findOne(ProductModel, {
      _id: new mongoose.Types.ObjectId(item.product_id),
    });

    if (!product) {
      console.error(`Product ${item.product_id} not found for stock release`);
      continue;
    }

    // Get stock record
    let stock = await repository.findOne(StockModel, { product_id: item.product_id });

    if (!stock) {
      console.error(`Stock record not found for product ${item.product_id}`);
      continue;
    }

    // Find color code
    const colorData = product.colors.find(
      (c) => c.colorCode === item.color || c.colorName === item.color
    );

    if (!colorData) {
      console.error(`Color ${item.color} not found in product ${item.product_id}`);
      continue;
    }

    const colorCode = colorData.colorCode;
    const reservedColorIndex = stock.reserved_stock_by_color.findIndex(
      (c) => c.colorCode === colorCode
    );
    const availableColorIndex = stock.available_stock_by_color.findIndex(
      (c) => c.colorCode === colorCode
    );

    if (reservedColorIndex === -1 || availableColorIndex === -1) {
      console.error(`Color ${colorCode} not found in stock record for product ${item.product_id}`);
      continue;
    }

    const reservedColorData = stock.reserved_stock_by_color[reservedColorIndex];
    const availableColorData = stock.available_stock_by_color[availableColorIndex];

    if (product.hasSizes && item.size) {
      // Product with sizes
      const reservedSizeIndex = reservedColorData.sizes
        ? reservedColorData.sizes.findIndex((s) => s.size === item.size)
        : -1;
      const availableSizeIndex = availableColorData.sizes
        ? availableColorData.sizes.findIndex((s) => s.size === item.size)
        : -1;

      if (reservedSizeIndex !== -1 && availableSizeIndex !== -1) {
        // Decrease reserved stock
        reservedColorData.sizes[reservedSizeIndex].reservedStock = Math.max(
          0,
          reservedColorData.sizes[reservedSizeIndex].reservedStock - item.qty
        );
        // Increase available stock
        availableColorData.sizes[availableSizeIndex].availableStock += item.qty;
      }
    } else {
      // Product without sizes
      reservedColorData.reservedStock = Math.max(
        0,
        reservedColorData.reservedStock - item.qty
      );
      availableColorData.availableStock += item.qty;
    }

    stock.markModified('reserved_stock_by_color');
    stock.markModified('available_stock_by_color');
    await repository.save(stock);
  }
};

/**
 * Restore stock from cancelled sub-order
 * @param {String} subOrderId - Sub-order ID
 * @returns {Promise<void>}
 */
module.exports.restoreStockFromCancelledSubOrder = async (subOrderId) => {
  const SubOrderModel = require('../subOrder/suborder.model');
  const OrderModel = require('../order/order.model');
  const { paymentStatus } = require('../../config/order.config');

  const subOrder = await repository.findOne(SubOrderModel, {
    _id: new mongoose.Types.ObjectId(subOrderId),
  });

  if (!subOrder || !subOrder.products_list) {
    return;
  }

  // Get main order to check payment status
  const mainOrder = await repository.findOne(OrderModel, {
    _id: subOrder.main_order_id,
  });

  // Only restore stock if main order was paid (stock was already sold)
  if (!mainOrder || mainOrder.paymentStatus !== paymentStatus.PAID) {
    // If not paid, just release reserved stock
    await module.exports.releaseReservedStockForSubOrder(subOrderId);
    return;
  }

  // If paid, restore stock (was already sold)
  for (const item of subOrder.products_list) {
    const product = await repository.findOne(ProductModel, {
      _id: new mongoose.Types.ObjectId(item.product_id),
    });

    if (!product) {
      console.error(`Product ${item.product_id} not found for stock restoration`);
      continue;
    }

    // Get stock record
    let stock = await repository.findOne(StockModel, { product_id: item.product_id });

    if (!stock) {
      console.error(`Stock record not found for product ${item.product_id}`);
      continue;
    }

    // Find color code
    const colorData = product.colors.find(
      (c) => c.colorCode === item.color || c.colorName === item.color
    );

    if (!colorData) {
      console.error(`Color ${item.color} not found in product ${item.product_id}`);
      continue;
    }

    const colorCode = colorData.colorCode;
    const price = product.price;

    // Decrease sales count and earnings
    stock.sales_count = Math.max(0, stock.sales_count - item.qty);
    stock.total_earnings = Math.max(0, stock.total_earnings - price * item.qty);

    // Update sales count by color
    const salesColorIndex = stock.salesCountByColor.findIndex(
      (c) => c.colorCode === colorCode
    );

    if (salesColorIndex !== -1) {
      const salesColorData = stock.salesCountByColor[salesColorIndex];

      if (product.hasSizes && item.size) {
        const sizeIndex = salesColorData.sizes
          ? salesColorData.sizes.findIndex((s) => s.size === item.size)
          : -1;

        if (sizeIndex !== -1) {
          salesColorData.sizes[sizeIndex].salesCount = Math.max(
            0,
            salesColorData.sizes[sizeIndex].salesCount - item.qty
          );
        }
      } else {
        salesColorData.salesCount = Math.max(
          0,
          salesColorData.salesCount - item.qty
        );
      }
    }

    // Increase available stock
    const availableColorIndex = stock.available_stock_by_color.findIndex(
      (c) => c.colorCode === colorCode
    );

    if (availableColorIndex !== -1) {
      const availableColorData = stock.available_stock_by_color[availableColorIndex];

      if (product.hasSizes && item.size) {
        const sizeIndex = availableColorData.sizes
          ? availableColorData.sizes.findIndex((s) => s.size === item.size)
          : -1;

        if (sizeIndex !== -1) {
          availableColorData.sizes[sizeIndex].availableStock += item.qty;
        }
      } else {
        availableColorData.availableStock += item.qty;
      }
    }

    stock.markModified('salesCountByColor');
    stock.markModified('available_stock_by_color');
    await repository.save(stock);
  }
};
