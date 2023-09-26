const { resolve } = require('path');
const Razorpay=require('razorpay')
const Order = require('../models/ordermodel');
const crypto=require('crypto')

var instance = new Razorpay({
  key_id: process.env.RZP_key_id,
  key_secret: process.env.RZP_key_secret,
});

function rzpOrder(order) {
  return new Promise((resolve,reject)=>{
    var options = {
      amount: order.totalAmount*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: order.orderID
    };
    instance.orders.create(options, function(err, order) {
      //console.log(order);
      resolve(order)
    });
  })
}
async function rzpVerify(details) {
  console.log(details.order.receipt)
let order=await Order.find({orderID:details.order.receipt})
order=order[0]
let hmac=crypto.createHmac('sha256',process.env.RZP_key_secret)

hmac.update(details.payment.razorpay_order_id+'|'+details.payment.razorpay_payment_id)
hmac=hmac.digest('hex')
if(hmac==details.payment.razorpay_signature){
order.paymentStatus='Paid'
order.paymentDetails.paymentID=details.payment.razorpay_payment_id
order.paymentDetails.paymentOrderId=details.payment.razorpay_order_id
}else{
  order.paymentStatus='Failed'
  order.orderStatus='Cancelled'
  
}

await order.save()
return order._id

}
module.exports={rzpOrder,rzpVerify}