const mongoose = require('mongoose');
const { Schema } = mongoose;
const { subOrderStatus, sellerPaymentStatus, deliveryStatus } = require('../../config/suborder.config');

const subOrderSchema = new Schema(
  {
    main_order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'order',
      required: true,
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    buyer_id: {
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
    shipping_fee: {
      type: Number,
      default: 0,
    },
    tracking_number: {
      type: String,
      default: null,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    platformCharges: {
      transactionFee: {
        type: Number,
        default: 0,
      },
      platformFee: {
        type: Number,
        default: 0,
      },
    },
    finalTotal: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: Object.values(subOrderStatus),
      default: subOrderStatus.PENDING,
    },
    seller_payment_status: {
      type: String,
      enum: Object.values(sellerPaymentStatus),
      default: sellerPaymentStatus.PENDING,
    },
    delivery_status: {
      type: String,
      enum: Object.values(deliveryStatus),
      default: deliveryStatus.PENDING,
    },
    delivery_confirmed: {
      type: Boolean,
      default: false,
    },
    delivery_confirmed_at: {
      type: Date,
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

module.exports = mongoose.model('suborder', subOrderSchema);
