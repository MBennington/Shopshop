const mongoose = require('mongoose');
const { Schema } = mongoose;
const {
  orderStatus,
  paymentStatus,
  paymentMethod,
} = require('../../config/order.config');

const orderSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    products_list: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'product',
          required: true,
        },
        qty: { type: Number, required: true },
        color: { type: String, required: true },
        size: { type: String },
        subtotal: { type: Number, required: true },
      },
    ],

    shippingAddress: {
      firstName: { type: String },
      lastName: { type: String },
      label: { type: String },
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      province: { type: String },
      country: { type: String },
      phone: { type: String },
    },

    paymentMethod: {
      type: String,
      enum: Object.values(paymentMethod),
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(paymentStatus),
      default: paymentStatus.PENDING,
    },

    orderStatus: {
      type: String,
      enum: Object.values(orderStatus),
      default: orderStatus.PENDING,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    // Platform charges breakdown (dynamic structure)
    // Stores all fee types as key-value pairs for extensibility
    platformCharges: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    // Also store as object for easier querying and compatibility
    platformChargesObject: {
      type: Schema.Types.Mixed,
      default: {},
    },
    // Detailed breakdown for transparency
    platformChargesBreakdown: {
      type: [
        {
          name: { type: String, required: true },
          amount: { type: Number, required: true },
          description: { type: String, required: true },
          type: { type: String, required: true }, // 'percentage' or 'fixed'
          value: { type: Schema.Types.Mixed }, // The original value from config
        },
      ],
      default: [],
    },

    // Final total including all charges
    finalTotal: {
      type: Number,
      required: true,
    },

    // Sub-orders for multi-seller orders
    sub_orders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'suborder',
    }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = mongoose.model('order', orderSchema);
