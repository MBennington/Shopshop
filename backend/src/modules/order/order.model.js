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
      ref: 'User',
      required: true,
    },

    products_list: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        qty: { type: Number, required: true },
        color: { type: String, required: true },
        size: { type: String },
        subtotal: { type: Number, required: true },
      },
    ],

    shippingAddress: {
      type: String,
      required: true,
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
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = mongoose.model('order', orderSchema);
