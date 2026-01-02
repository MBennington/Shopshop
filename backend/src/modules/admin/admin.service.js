const UserModel = require('../users/user.model');
const OrderModel = require('../order/order.model');
const ProductModel = require('../products/product.model');
const PayoutModel = require('../payout/payout.model');
const PaymentModel = require('../payment/payment.model');
const { roles } = require('../../config/role.config');
const { paymentStatus } = require('../../config/order.config');
const mongoose = require('mongoose');
const repository = require('../../services/repository.service');
const productService = require('../products/product.service');
const stockService = require('../../services/stock.service');

/**
 * Get admin dashboard statistics
 * @returns {Promise<Object>}
 */
module.exports.getDashboardStats = async () => {
  try {
    // Get user counts
    const [totalUsers, totalBuyers, totalSellers, totalAdmins] =
      await Promise.all([
        UserModel.countDocuments(),
        UserModel.countDocuments({ role: roles.buyer }),
        UserModel.countDocuments({ role: roles.seller }),
        UserModel.countDocuments({ role: roles.admin }),
      ]);

    // Get order counts and revenue
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(now);
    monthStart.setMonth(monthStart.getMonth() - 1);

    // Total orders
    const totalOrders = await OrderModel.countDocuments();

    // Today's orders
    const todayOrders = await OrderModel.countDocuments({
      created_at: { $gte: todayStart },
    });

    // This week's orders
    const weekOrders = await OrderModel.countDocuments({
      created_at: { $gte: weekStart },
    });

    // This month's orders
    const monthOrders = await OrderModel.countDocuments({
      created_at: { $gte: monthStart },
    });

    // Calculate revenue from payments
    const allPayments = await PaymentModel.find({
      paymentStatus: paymentStatus.PAID,
    }).lean();

    const totalRevenue = allPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    // Today's revenue
    const todayPayments = await PaymentModel.find({
      paymentStatus: paymentStatus.PAID,
      created_at: { $gte: todayStart },
    }).lean();
    const todayRevenue = todayPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    // This week's revenue
    const weekPayments = await PaymentModel.find({
      paymentStatus: paymentStatus.PAID,
      created_at: { $gte: weekStart },
    }).lean();
    const weekRevenue = weekPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    // This month's revenue
    const monthPayments = await PaymentModel.find({
      paymentStatus: paymentStatus.PAID,
      created_at: { $gte: monthStart },
    }).lean();
    const monthRevenue = monthPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    // Get pending payouts
    const pendingPayouts = await PayoutModel.find({ status: 'PENDING' }).lean();
    const pendingPayoutCount = pendingPayouts.length;
    const pendingPayoutAmount = pendingPayouts.reduce(
      (sum, p) => sum + (p.amount_requested || 0),
      0
    );

    // Get active products
    const activeProducts = await ProductModel.countDocuments({
      isActive: { $ne: false },
    });

    // Calculate platform revenue (platform charges from orders)
    // This is a simplified calculation - you may need to adjust based on your platform charges structure
    const ordersWithCharges = await OrderModel.find({
      platformChargesObject: { $exists: true, $ne: {} },
    }).lean();

    let platformRevenue = 0;
    ordersWithCharges.forEach((order) => {
      if (order.platformChargesObject) {
        const charges = Object.values(order.platformChargesObject);
        platformRevenue += charges.reduce(
          (sum, charge) => sum + (charge || 0),
          0
        );
      }
    });

    return {
      totalUsers,
      totalBuyers,
      totalSellers,
      totalAdmins,
      totalOrders,
      totalRevenue,
      pendingPayouts: pendingPayoutCount,
      pendingPayoutAmount,
      activeProducts,
      platformRevenue,
      todayOrders,
      todayRevenue,
      weekOrders,
      weekRevenue,
      monthOrders,
      monthRevenue,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
};

/**
 * Get all products for admin with filters (category, seller)
 * @param {Object} filters - { category, sellerId, page, limit, search }
 * @returns {Promise<Object>}
 */
module.exports.getAllProductsForAdmin = async (filters = {}) => {
  try {
    const { category, sellerId, page = 1, limit = 20, search = '' } = filters;
    const skip = (page - 1) * limit;

    // Build query
    let query = {}; // Admin can see all products including inactive

    if (category) {
      query.category = category;
    }

    if (sellerId) {
      query.seller = new mongoose.Types.ObjectId(sellerId);
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Get products with seller info
    const products = await ProductModel.find(query)
      .populate('seller', '_id name sellerInfo.businessName')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await ProductModel.countDocuments(query);

    // Calculate inventory and stock data for each product
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const productObj = { ...product };
        productObj.totalInventory =
          productService.calculateTotalInventory(productObj);

        // Calculate available stock for each color/size variant
        if (productObj.colors && productObj.colors.length > 0) {
          for (
            let colorIndex = 0;
            colorIndex < productObj.colors.length;
            colorIndex++
          ) {
            const color = productObj.colors[colorIndex];

            if (productObj.hasSizes && color.sizes) {
              // Product with sizes
              for (
                let sizeIndex = 0;
                sizeIndex < color.sizes.length;
                sizeIndex++
              ) {
                const size = color.sizes[sizeIndex];
                const productDoc = await ProductModel.findById(product._id);
                const availableStock =
                  await stockService.calculateAvailableStock(
                    productDoc,
                    color.colorCode,
                    size.size
                  );
                productObj.colors[colorIndex].sizes[
                  sizeIndex
                ].availableQuantity = availableStock;
              }
            } else {
              // Product without sizes
              const productDoc = await ProductModel.findById(product._id);
              const availableStock = await stockService.calculateAvailableStock(
                productDoc,
                color.colorCode,
                null
              );
              productObj.colors[colorIndex].availableQuantity = availableStock;
            }
          }
        }

        return productObj;
      })
    );

    return {
      products: productsWithStock,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting products for admin:', error);
    throw new Error('Failed to fetch products');
  }
};

/**
 * Deactivate product (admin only)
 * @param {String} productId
 * @returns {Promise<Object>}
 */
module.exports.deactivateProduct = async (productId) => {
  try {
    const product = await repository.updateOne(
      ProductModel,
      { _id: new mongoose.Types.ObjectId(productId) },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      throw new Error('Product not found');
    }

    return product.toObject();
  } catch (error) {
    console.error('Error deactivating product:', error);
    throw new Error('Failed to deactivate product');
  }
};

/**
 * Activate product (admin only)
 * @param {String} productId
 * @returns {Promise<Object>}
 */
module.exports.activateProduct = async (productId) => {
  try {
    const product = await repository.updateOne(
      ProductModel,
      { _id: new mongoose.Types.ObjectId(productId) },
      { isActive: true },
      { new: true }
    );

    if (!product) {
      throw new Error('Product not found');
    }

    return product.toObject();
  } catch (error) {
    console.error('Error activating product:', error);
    throw new Error('Failed to activate product');
  }
};

/**
 * Get stock data for a product (admin only)
 * @param {String} productId
 * @returns {Promise<Object>}
 */
module.exports.getProductStockData = async (productId) => {
  try {
    const product = await ProductModel.findById(productId)
      .populate('seller', '_id name sellerInfo.businessName')
      .lean();

    if (!product) {
      throw new Error('Product not found');
    }

    const productDoc = await ProductModel.findById(productId);
    const totalInventory = productService.calculateTotalInventory(product);

    // Calculate stock breakdown
    const stockBreakdown = {
      totalInventory,
      colors: [],
    };

    if (product.colors && product.colors.length > 0) {
      for (const color of product.colors) {
        const colorStock = {
          colorCode: color.colorCode,
          colorName: color.colorName,
          totalQuantity: 0,
          availableQuantity: 0,
          reservedQuantity: 0,
          soldQuantity: 0,
          sizes: [],
        };

        if (product.hasSizes && color.sizes) {
          // Product with sizes
          for (const size of color.sizes) {
            const availableStock = await stockService.calculateAvailableStock(
              productDoc,
              color.colorCode,
              size.size
            );

            // Get reserved and sold stock
            const reservedStock = await stockService.getReservedStock(
              productId,
              color.colorCode,
              size.size
            );
            const soldStock = await stockService.getSoldStock(
              productId,
              color.colorCode,
              size.size
            );

            colorStock.totalQuantity += size.quantity || 0;
            colorStock.availableQuantity += availableStock;
            colorStock.reservedQuantity += reservedStock;
            colorStock.soldQuantity += soldStock;

            colorStock.sizes.push({
              size: size.size,
              totalQuantity: size.quantity || 0,
              availableQuantity: availableStock,
              reservedQuantity: reservedStock,
              soldQuantity: soldStock,
            });
          }
        } else {
          // Product without sizes
          const availableStock = await stockService.calculateAvailableStock(
            productDoc,
            color.colorCode,
            null
          );
          const reservedStock = await stockService.getReservedStock(
            productId,
            color.colorCode,
            null
          );
          const soldStock = await stockService.getSoldStock(
            productId,
            color.colorCode,
            null
          );

          colorStock.totalQuantity = color.quantity || 0;
          colorStock.availableQuantity = availableStock;
          colorStock.reservedQuantity = reservedStock;
          colorStock.soldQuantity = soldStock;
        }

        stockBreakdown.colors.push(colorStock);
      }
    }

    return {
      product: {
        _id: product._id,
        name: product.name,
        category: product.category,
        seller: product.seller,
      },
      stockBreakdown,
    };
  } catch (error) {
    console.error('Error getting product stock data:', error);
    throw new Error('Failed to fetch stock data');
  }
};

/**
 * Get comprehensive analytics data for admin
 * @param {Object} filters - { startDate, endDate, period }
 * @returns {Promise<Object>}
 */
module.exports.getAnalytics = async (filters = {}) => {
  try {
    const now = new Date();
    let startDate, endDate = now;

    // Determine date range based on period
    const period = filters.period || '30d';
    if (period === '7d') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90d') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 90);
    } else if (period === '1y') {
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate = filters.startDate ? new Date(filters.startDate) : new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      endDate = filters.endDate ? new Date(filters.endDate) : now;
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Revenue trends (daily breakdown)
    const revenueTrends = await PaymentModel.aggregate([
      {
        $match: {
          paymentStatus: paymentStatus.PAID,
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Order trends (daily breakdown)
    const orderTrends = await OrderModel.aggregate([
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User growth trends
    const userGrowthTrends = await UserModel.aggregate([
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' },
          },
          buyers: {
            $sum: { $cond: [{ $eq: ['$role', roles.buyer] }, 1, 0] },
          },
          sellers: {
            $sum: { $cond: [{ $eq: ['$role', roles.seller] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Category performance
    const categoryPerformance = await OrderModel.aggregate([
      {
        $match: {
          paymentStatus: paymentStatus.PAID,
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: '$products_list' },
      {
        $lookup: {
          from: 'products',
          localField: 'products_list.product_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: '$products_list.subtotal' },
          orders: { $sum: 1 },
          quantity: { $sum: '$products_list.qty' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Top selling products
    const topProducts = await OrderModel.aggregate([
      {
        $match: {
          paymentStatus: paymentStatus.PAID,
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: '$products_list' },
      {
        $lookup: {
          from: 'products',
          localField: 'products_list.product_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$products_list.product_id',
          name: { $first: '$product.name' },
          category: { $first: '$product.category' },
          revenue: { $sum: '$products_list.subtotal' },
          quantity: { $sum: '$products_list.qty' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Top sellers/shops
    const topSellers = await OrderModel.aggregate([
      {
        $match: {
          paymentStatus: paymentStatus.PAID,
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: '$products_list' },
      {
        $lookup: {
          from: 'products',
          localField: 'products_list.product_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'users',
          localField: 'product.seller',
          foreignField: '_id',
          as: 'seller',
        },
      },
      { $unwind: '$seller' },
      {
        $group: {
          _id: '$product.seller',
          sellerName: { $first: '$seller.name' },
          businessName: { $first: '$seller.sellerInfo.businessName' },
          revenue: { $sum: '$products_list.subtotal' },
          orders: { $sum: 1 },
          productsSold: { $sum: '$products_list.qty' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Overall statistics
    const totalRevenue = revenueTrends.reduce(
      (sum, item) => sum + (item.revenue || 0),
      0
    );
    const totalOrders = orderTrends.reduce(
      (sum, item) => sum + (item.count || 0),
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // User statistics
    const newUsers = await UserModel.countDocuments({
      created_at: { $gte: startDate, $lte: endDate },
    });
    const newBuyers = await UserModel.countDocuments({
      role: roles.buyer,
      created_at: { $gte: startDate, $lte: endDate },
    });
    const newSellers = await UserModel.countDocuments({
      role: roles.seller,
      created_at: { $gte: startDate, $lte: endDate },
    });

    return {
      period,
      dateRange: {
        startDate,
        endDate,
      },
      revenueTrends,
      orderTrends,
      userGrowthTrends,
      categoryPerformance,
      topProducts,
      topSellers,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        newUsers,
        newBuyers,
        newSellers,
      },
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw new Error('Failed to fetch analytics data');
  }
};
