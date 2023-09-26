const mongoose = require('mongoose');



const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
        required: true
      },
      salePrice:{
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  Address: {
    type: String,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled','Returned'],
    default: 'Pending'
  },
  deliveryDate: {
    type: Date,
    default: function () {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      return sevenDaysFromNow;
    }
  },
  orderID: {
    type: String,
    default: function () {
      return `ORD-${new Date().getTime().toString()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    },
    unique: true, 
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  paymentDetails: {
    paymentID:{
      type: String,
      default: ''
    },
    paymentOrderId:{
      type:String,
      default: ''
    }
  },
  return:{
    type:Boolean,
    default:false
  },
  reason:{
    type:String,
    default:'No return request'
  },
  returninfo:{
    type:String,
    enum: ['No return request','Pending', 'Approved', 'Declined'],
    default:'No return request'
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});
orderSchema.pre('save', function (next) {
  this.lastUpdated = new Date(); // Update the lastUpdated field with the current timestamp
  next();
});
const Order = mongoose.model('Order', orderSchema,'Order');

module.exports = Order;
