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
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
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
  }
});

const Order = mongoose.model('Order', orderSchema,'Order');

module.exports = Order;
