const mongoose = require('mongoose');
const { Schema } = mongoose;
const { paymentStatus, paymentMethod } = require('../../config/order.config');

const paymentSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'order',
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

    amount: {
      type: Number,
      required: true,
    },

    payhere_payment_id: {
      type: String,
      default: null,
    },

    currency: {
      type: String,
      default: 'LKR',
    },

    method: {
      type: String,
      default: null,
    },

    status_message: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = mongoose.model('payment', paymentSchema);
