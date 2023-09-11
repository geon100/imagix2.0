const Razorpay=require('razorpay')

var instance = new Razorpay({
  key_id: process.env.RZP_key_id,
  key_secret: process.env.RZP_key_secret,
});

function rzpOrder(order) {
  var options = {
    amount: order.totalAmount,  // amount in the smallest currency unit
    currency: "INR",
    receipt: order.orderID
  };
  instance.orders.create(options, function(err, order) {
    console.log(order);
  });
}

module.exports={rzpOrder}