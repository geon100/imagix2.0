const Order=require('../models/ordermodel')
const User=require('../models/usermodel')
const Product=require('../models/productmodel')
let crederror=false
const ordersLoad=async(req,res)=>{
  const orders=await Order.find().populate('customer').populate('products.product')

  res.render('admin/orders',{orders})
}
const ordersChange=async(req,res)=>{
  console.log(req.body.orderStatus)
  const order=await Order.findById(req.body.id)
  order.orderStatus=req.body.orderStatus
  if(order.orderStatus==='Delivered')
  {
    order.deliveryDate=Date.now()
    order.paymentStatus='Paid'
  }
  order.save()
  res.redirect('/admin/orders')
}
const singleOrder=async(req,res)=>{
  const order=await Order.findById(req.query.id).populate('customer').populate('products.product')
  res.render('admin/orderview',{order})
}


module.exports={ordersLoad,ordersChange,singleOrder}