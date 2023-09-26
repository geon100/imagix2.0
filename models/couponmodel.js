const mongoose = require('mongoose');

// Define the Coupon Schema
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true, // Each coupon code must be unique
  },
  description: {
    type: String,
    required: true,
  },
  discountPercent: {
    type: Number,
    required: true,
  },
  minPurchase: {
    type: Number,
    min: 0
  },
  maxDiscount: {
    type: Number,
    min: 0
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  expirationDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  appliedUsers:{
    type:Array
  }
});

// Middleware to set the expirationDate 15 days from createdAt when creating a new coupon
couponSchema.pre('save', function (next) {
  if (!this.expirationDate) {
    const validityDate = new Date(this.createdAt);
    validityDate.setDate(validityDate.getDate() + 15);
    this.expirationDate = validityDate;
  }
  
  const currentDate = new Date();
  if (this.expirationDate && currentDate > this.expirationDate) {
    this.isActive = false;
  }
  
  next();
});

module.exports = mongoose.model('Coupon', couponSchema, 'Coupon');
