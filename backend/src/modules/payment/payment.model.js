const mongoose = require('mongoose');
const { Schema } = mongoose;
const { paymentStatus, paymentMethod } = require('../../config/order.config');

const orderSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    oder_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'oder',
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
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = mongoose.model('payment', paymentSchema);
