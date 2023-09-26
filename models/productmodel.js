const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    regularPrice: {
        type: Number,
        required: true,
    },
    salePrice: {
        type: Number,
        required: true,
    },
    createdOn: {
        type: Date,
        default: Date.now,
    },
    stock: {
        type: Number,
        required: true,
    },
    images: {
        type: Array,
        required: true,
    },
    rating: {
      type: Number,
      default: 0,
  },
    reviews: [reviewSchema],
    isActive:{
      type:Boolean,
      default:true
    },
    isDelete:{
      type:Boolean,
      default:false
    }
});

productSchema.pre('save', async function (next) {
  const product = this;
  if (product.reviews && product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));
  } else {
      product.rating = 0;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema,'Product');
