const mongoose = require('mongoose');
const { Schema } = mongoose;
const {
  orderStatus,
  paymentStatus,
  paymentMethod,
} = require('../../config/order.config');

const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true },
        color: { type: String },
        size: { type: String },
      },
    ],

    shippingAddress: {
      label: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      enum: Object.values(paymentMethod),
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(paymentStatus),
      default: 'pending',
    },

    orderStatus: {
      type: String,
      enum: Object.values(orderStatus),
      default: 'pending',
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
