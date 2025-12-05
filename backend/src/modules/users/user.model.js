const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { roles } = require('../../config/role.config');

const userSchema = new Schema(
  {
    // Shared fields
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(roles), default: roles.buyer },
    profilePicture: { type: String, default: null },

    // Buyer-specific
    savedAddresses: [
      {
        label: { type: String }, // e.g., "Home", "Work"
        address: { type: String },
        city: { type: String },
        province: { type: String },
        postalCode: { type: String },
        country: { type: String },
      },
    ],

    // Notifications (shared between buyer and seller)
    notifications: {
      orderUpdates: { type: Boolean }, // buyer & seller
      productInquiries: { type: Boolean }, // seller only
      marketingEmails: { type: Boolean }, // optional
    },

    // Buyer privacy & preferences
    privacySettings: {
      twoFactorAuth: { type: Boolean }, // optional to implement
    },

    accountPreferences: {
      language: { type: String },
      currency: { type: String },
    },

    // Seller-specific
    sellerInfo: {
      businessName: { type: String },
      phone: { type: String },
      businessType: { type: String },
      businessDescription: {
        type: String,
        default: null,
      },
      contactDetails: {
        address: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String },
      },
      payouts: {
        paymentMethod: { type: String },
        accountNumber: { type: String },
        routingNumber: { type: String },
      },
      baseShippingFee: {
        type: Number,
        default: null,
        min: 0,
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function (next) {
  if (
    this.role === roles.seller &&
    (!this.sellerInfo.businessDescription ||
      this.sellerInfo.businessDescription.trim() === '')
  ) {
    const name = this.sellerInfo.businessName || 'Our Store';
    this.sellerInfo.businessDescription = `Welcome to ${name}! We offer a curated selection of premium products, handpicked for quality and style. Our mission is to provide you with the best shopping experience.`;
  }
  next();
});

userSchema.index({ email: 1 });

module.exports = mongoose.model('user', userSchema);
