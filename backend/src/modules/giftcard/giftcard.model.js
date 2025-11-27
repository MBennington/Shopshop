const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
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
    pin: {
      type: String,
      required: true,
      // PIN is hashed, never store plain text
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
    redeemedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
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
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'order',
      default: null,
    },
    emailRecipient: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    // Gift card sharing fields
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null, // If null, owner is purchasedBy
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    acceptanceToken: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // Allow multiple nulls
    },
    tokenExpiry: {
      type: Date,
      default: null,
    },
    receiverEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
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
giftCardSchema.index({ redeemedBy: 1 });
giftCardSchema.index({ status: 1 });
giftCardSchema.index({ expiryDate: 1 });
giftCardSchema.index({ owner: 1 });
giftCardSchema.index({ acceptanceToken: 1 });
giftCardSchema.index({ isShared: 1 });
giftCardSchema.index({ isAccepted: 1 });

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

// Method to verify PIN
giftCardSchema.methods.verifyPin = async function (inputPin) {
  return await bcrypt.compare(inputPin, this.pin);
};

// Hash PIN before saving
giftCardSchema.pre('save', async function (next) {
  // Only hash the PIN if it's been modified (and is not already hashed)
  if (!this.isModified('pin')) return next();
  
  // If PIN is already hashed (starts with $2a$ or $2b$), skip hashing
  if (this.pin && this.pin.startsWith('$2')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('giftcard', giftCardSchema);

