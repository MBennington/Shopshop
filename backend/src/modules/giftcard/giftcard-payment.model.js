const mongoose = require('mongoose');
const { Schema } = mongoose;
const { paymentStatus } = require('../../config/order.config');

const giftCardPaymentSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    gift_card_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'giftcard',
      default: null,
    },

    payment_id: {
      type: String,
      required: true,
      unique: true,
      // Format: GC-{timestamp}-{random}
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

    // Store purchase details temporarily until payment succeeds
    purchaseDetails: {
      amount: {
        type: Number,
        required: true,
      },
      recipientEmail: {
        type: String,
        default: null,
        trim: true,
        lowercase: true,
      },
      recipientName: {
        type: String,
        default: null,
        trim: true,
      },
      personalMessage: {
        type: String,
        default: null,
        trim: true,
      },
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Indexes for performance
giftCardPaymentSchema.index({ payment_id: 1 });
giftCardPaymentSchema.index({ user_id: 1 });
giftCardPaymentSchema.index({ gift_card_id: 1 });
giftCardPaymentSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('giftcardpayment', giftCardPaymentSchema);
