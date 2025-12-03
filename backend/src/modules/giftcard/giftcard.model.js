const mongoose = require('mongoose');
const { Schema } = mongoose;
const { giftCardStatus } = require('../../config/giftcard.config');

const giftCardSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    receiverEmail: {
      type: String,
      required: true,
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
      default: 'A special gift, just for you.',
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(giftCardStatus),
      default: giftCardStatus.ACTIVE,
    },
    redeemedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
    redemptionHistory: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'order',
        },
        amountUsed: {
          type: Number,
          required: true,
        },
        remainingBalance: {
          type: Number,
          required: true,
        },
        redeemedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// Indexes for performance
giftCardSchema.index({ code: 1 });
giftCardSchema.index({ purchasedBy: 1 });
giftCardSchema.index({ receiverEmail: 1 });
giftCardSchema.index({ redeemedBy: 1 });
giftCardSchema.index({ status: 1 });
giftCardSchema.index({ expiryDate: 1 });

// Virtual to check if gift card is expired
giftCardSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

// Method to check if gift card can be used
giftCardSchema.methods.canBeUsed = function () {
  return (
    this.status === giftCardStatus.ACTIVE &&
    this.remainingBalance > 0 &&
    !this.isExpired
  );
};

module.exports = mongoose.model('giftcard', giftCardSchema);
