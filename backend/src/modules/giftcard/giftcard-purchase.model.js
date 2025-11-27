const mongoose = require('mongoose');
const { Schema } = mongoose;
const { paymentStatus } = require('../../config/order.config');

const giftCardPurchaseSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    recipientEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'payment',
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(paymentStatus),
      default: paymentStatus.PENDING,
    },
    giftCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'giftcard',
      default: null,
    },
    giftCardCode: {
      type: String,
      default: null,
    },
    giftCardPin: {
      type: String,
      default: null,
    },
    payhere_payment_id: {
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

module.exports = mongoose.model('giftcardpurchase', giftCardPurchaseSchema);

