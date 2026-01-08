const mongoose = require('mongoose');
const SubOrderModel = require('../subOrder/suborder.model');
const OrderModel = require('../order/order.model');
const PaymentModel = require('../payment/payment.model');
const ProductModel = require('../products/product.model');
const { paymentStatus } = require('../../config/order.config');
const { subOrderStatus } = require('../../config/suborder.config');

/**
 * Get comprehensive analytics data for seller
 * @param {String} sellerId - Seller ID
 * @param {Object} filters - { startDate, endDate, period }
 * @returns {Promise<Object>}
 */
module.exports.getAnalytics = async (sellerId, filters = {}) => {
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

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    // Revenue trends (daily breakdown) - based on sub-orders
    const revenueTrends = await SubOrderModel.aggregate([
      {
        $match: {
          seller_id: sellerObjectId,
          orderStatus: subOrderStatus.DELIVERED,
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' },
          },
          revenue: { $sum: '$finalTotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Order trends (daily breakdown) - based on sub-orders
    const orderTrends = await SubOrderModel.aggregate([
      {
        $match: {
          seller_id: sellerObjectId,
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

    // Order status breakdown
    const orderStatusBreakdown = await SubOrderModel.aggregate([
      {
        $match: {
          seller_id: sellerObjectId,
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    // Category performance - based on seller's products
    const categoryPerformance = await SubOrderModel.aggregate([
      {
        $match: {
          seller_id: sellerObjectId,
          orderStatus: subOrderStatus.DELIVERED,
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

    // Top selling products - seller's own products, sorted by quantity sold (best selling = most quantity sold)
    const topProducts = await SubOrderModel.aggregate([
      {
        $match: {
          seller_id: sellerObjectId,
          orderStatus: subOrderStatus.DELIVERED,
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
          _id: {
            subOrderId: '$_id',
            productId: '$products_list.product_id',
          },
          name: { $first: '$product.name' },
          category: { $first: '$product.category' },
          revenue: { $first: '$products_list.subtotal' },
          quantity: { $first: '$products_list.qty' },
        },
      },
      {
        $group: {
          _id: '$_id.productId',
          name: { $first: '$name' },
          category: { $first: '$category' },
          revenue: { $sum: '$revenue' },
          quantity: { $sum: '$quantity' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { quantity: -1 } },
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

    // Total products sold
    const totalProductsSold = await SubOrderModel.aggregate([
      {
        $match: {
          seller_id: sellerObjectId,
          orderStatus: subOrderStatus.DELIVERED,
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: '$products_list' },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$products_list.qty' },
        },
      },
    ]);

    const productsSold = totalProductsSold.length > 0 ? totalProductsSold[0].totalQuantity : 0;

    // Get order status counts
    const statusCounts = {
      pending: 0,
      processing: 0,
      packed: 0,
      dispatched: 0,
      delivered: 0,
      cancelled: 0,
    };

    orderStatusBreakdown.forEach((status) => {
      const statusKey = status._id?.toLowerCase() || '';
      if (statusCounts.hasOwnProperty(statusKey)) {
        statusCounts[statusKey] = status.count;
      }
    });

    return {
      period,
      dateRange: {
        startDate,
        endDate,
      },
      revenueTrends,
      orderTrends,
      orderStatusBreakdown: statusCounts,
      categoryPerformance,
      topProducts,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        productsSold,
      },
    };
  } catch (error) {
    console.error('Error getting seller analytics:', error);
    throw new Error('Failed to fetch seller analytics data');
  }
};



