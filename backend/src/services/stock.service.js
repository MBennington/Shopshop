const OrderModel = require('../modules/order/order.model');
const SubOrderModel = require('../modules/subOrder/suborder.model');
const ProductModel = require('../modules/products/product.model');
const { orderStatus, paymentStatus } = require('../config/order.config');
const { subOrderStatus } = require('../config/suborder.config');
const mongoose = require('mongoose');
const repository = require('./repository.service');

/**
 * Calculate available stock for a product variant
 * Available = Total - Reserved - Sold
 * 
 * @param {Object} product - Product document
 * @param {String} color - Color code or color name
 * @param {String} size - Size (optional, for products with sizes)
 * @returns {Promise<Number>} - Available stock quantity
 */
module.exports.calculateAvailableStock = async (product, color, size = null) => {
  if (!product || !product.colors || product.colors.length === 0) {
    return 0;
  }

  // Find the color
  const colorData = product.colors.find(
    (c) => c.colorCode === color || c.colorName === color
  );

  if (!colorData) {
    return 0;
  }

  // Get total stock for this variant
  let totalStock = 0;
  if (product.hasSizes && size) {
    const sizeData = colorData.sizes?.find((s) => s.size === size);
    totalStock = sizeData ? sizeData.quantity : 0;
  } else {
    totalStock = colorData.quantity || 0;
  }

  // Calculate reserved stock (from pending orders)
  const reservedStock = await this.getReservedStock(
    product._id,
    color,
    size
  );

  // Calculate sold stock (from paid orders)
  const soldStock = await this.getSoldStock(product._id, color, size);

  // Available = Total - Reserved - Sold
  const availableStock = totalStock - reservedStock - soldStock;

  return Math.max(0, availableStock); // Ensure non-negative
};

/**
 * Get reserved stock quantity for a product variant
 * Reserved = Sum of quantities from all pending orders
 * 
 * @param {ObjectId} productId - Product ID
 * @param {String} color - Color code or color name
 * @param {String} size - Size (optional)
 * @returns {Promise<Number>} - Reserved stock quantity
 */
module.exports.getReservedStock = async (productId, color, size = null) => {
  // Find all pending orders that contain this product variant
  const orders = await OrderModel.find({
    'products_list.product_id': new mongoose.Types.ObjectId(productId),
    paymentStatus: paymentStatus.PENDING,
    orderStatus: { $ne: orderStatus.CANCELLED },
  }).lean();

  let reservedQty = 0;

  orders.forEach((order) => {
    order.products_list?.forEach((item) => {
      if (
        item.product_id.toString() === productId.toString() &&
        item.color === color &&
        (size === null ? item.size === null || !item.size : item.size === size)
      ) {
        reservedQty += item.qty || 0;
      }
    });
  });

  return reservedQty;
};

/**
 * Get sold stock quantity for a product variant
 * Sold = Sum of quantities from all non-cancelled sub-orders in paid orders
 * 
 * @param {ObjectId} productId - Product ID
 * @param {String} color - Color code or color name
 * @param {String} size - Size (optional)
 * @returns {Promise<Number>} - Sold stock quantity
 */
module.exports.getSoldStock = async (productId, color, size = null) => {
  // Find all paid orders that contain this product variant
  const orders = await OrderModel.find({
    'products_list.product_id': new mongoose.Types.ObjectId(productId),
    paymentStatus: paymentStatus.PAID,
    orderStatus: { $ne: orderStatus.CANCELLED },
  }).lean();

  let soldQty = 0;

  for (const order of orders) {
    // Get all non-cancelled sub-orders for this main order
    const subOrders = await SubOrderModel.find({
      main_order_id: order._id,
      orderStatus: { $ne: subOrderStatus.CANCELLED },
    }).lean();

    // Sum quantities from sub-orders that contain this product variant
    subOrders.forEach((subOrder) => {
      subOrder.products_list?.forEach((item) => {
        if (
          item.product_id.toString() === productId.toString() &&
          item.color === color &&
          (size === null ? item.size === null || !item.size : item.size === size)
        ) {
          soldQty += item.qty || 0;
        }
      });
    });
  }

  return soldQty;
};

/**
 * Validate stock availability for order items
 * 
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

    const availableStock = await this.calculateAvailableStock(
      product,
      item.color,
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
 * Deduct stock from product after payment success
 * 
 * @param {String} orderId - Order ID
 * @returns {Promise<void>}
 */
module.exports.deductStock = async (orderId) => {
  const order = await repository.findOne(OrderModel, {
    _id: new mongoose.Types.ObjectId(orderId),
  });

  if (!order || !order.products_list) {
    return;
  }

  for (const item of order.products_list) {
    const product = await repository.findOne(ProductModel, {
      _id: new mongoose.Types.ObjectId(item.product_id),
    });

    if (!product) {
      console.error(`Product ${item.product_id} not found for stock deduction`);
      continue;
    }

    // Find the color
    const colorIndex = product.colors.findIndex(
      (c) => c.colorCode === item.color || c.colorName === item.color
    );

    if (colorIndex === -1) {
      console.error(
        `Color ${item.color} not found in product ${product._id}`
      );
      continue;
    }

    // Deduct stock
    if (product.hasSizes && item.size) {
      // Product with sizes
      const sizeIndex = product.colors[colorIndex].sizes.findIndex(
        (s) => s.size === item.size
      );
      if (sizeIndex !== -1) {
        product.colors[colorIndex].sizes[sizeIndex].quantity = Math.max(
          0,
          product.colors[colorIndex].sizes[sizeIndex].quantity - item.qty
        );
      }
    } else {
      // Product without sizes
      product.colors[colorIndex].quantity = Math.max(
        0,
        (product.colors[colorIndex].quantity || 0) - item.qty
      );
    }

    await repository.save(product);
  }
};

/**
 * Release reserved stock when payment fails or order is cancelled
 * Note: This is handled automatically by removing the order from pending status
 * The getReservedStock function will no longer count it, effectively releasing it
 * This function is kept for explicit release if needed in the future
 * 
 * @param {String} orderId - Order ID
 * @returns {Promise<void>}
 */
module.exports.releaseReservedStock = async (orderId) => {
  // Stock is automatically released when order status changes from PENDING to CANCELLED
  // or payment status changes from PENDING to FAILED
  // The getReservedStock function filters out cancelled/failed orders
  // So no explicit action needed, but keeping this function for clarity
  console.log(`Reserved stock released for order ${orderId} (handled automatically)`);
};

/**
 * Restore stock when a sub-order is cancelled
 * This restores stock for products in the cancelled sub-order
 * 
 * @param {String} subOrderId - Sub-order ID
 * @returns {Promise<void>}
 */
module.exports.restoreStockFromCancelledSubOrder = async (subOrderId) => {
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

  // Only restore stock if main order was paid (stock was already deducted)
  if (!mainOrder || mainOrder.paymentStatus !== paymentStatus.PAID) {
    return;
  }

  // Restore stock for each product in the cancelled sub-order
  for (const item of subOrder.products_list) {
    const product = await repository.findOne(ProductModel, {
      _id: new mongoose.Types.ObjectId(item.product_id),
    });

    if (!product) {
      console.error(`Product ${item.product_id} not found for stock restoration`);
      continue;
    }

    // Find the color
    const colorIndex = product.colors.findIndex(
      (c) => c.colorCode === item.color || c.colorName === item.color
    );

    if (colorIndex === -1) {
      console.error(
        `Color ${item.color} not found in product ${product._id}`
      );
      continue;
    }

    // Restore stock
    if (product.hasSizes && item.size) {
      // Product with sizes
      const sizeIndex = product.colors[colorIndex].sizes.findIndex(
        (s) => s.size === item.size
      );
      if (sizeIndex !== -1) {
        product.colors[colorIndex].sizes[sizeIndex].quantity =
          (product.colors[colorIndex].sizes[sizeIndex].quantity || 0) + item.qty;
      }
    } else {
      // Product without sizes
      product.colors[colorIndex].quantity =
        (product.colors[colorIndex].quantity || 0) + item.qty;
    }

    await repository.save(product);
  }
};

