const Order=require('../models/ordermodel')
const User=require('../models/usermodel')
const Product=require('../models/productmodel')

const fs = require('fs');


let crederror=false

const ordersLoad=async(req,res)=>{
 try {
  let orders=await Order.find().populate('customer').populate('products.product').sort({lastUpdated:-1})
  res.render('admin/orders',{orders})
 } catch (error) {
  console.log(error)
 }
}
const ordersChange=async(req,res)=>{
  
  try {
    const order=await Order.findById(req.body.id)
  order.orderStatus=req.body.orderStatus
  if(order.orderStatus==='Delivered')
  {
    order.deliveryDate=Date.now()
    order.paymentStatus='Paid'
  }else if(order.orderStatus==='Cancelled'){
    let product={}
    for (const val of order.products) {
     product = await Product.findById(val.product);
     product.stock+=val.quantity
    }
    await product.save()
    if(order.paymentMethod!=='COD'){
      const user=await User.findById(order.customer)
      user.Wallet+=order.totalAmount
      await user.save()
    }
  }
  await order.save()
  res.redirect('/admin/orders')
  } catch (error) {
    console.log(error);
  }
}
const singleOrder=async(req,res)=>{
  try {
    const order=await Order.findById(req.query.id).populate('customer').populate('products.product')
  res.render('admin/orderview',{order})
  } catch (error) {
    console.log(error);
  }
}
const returnApprove=async(req,res)=>{
try {
  const order=await Order.findById(req.body.id)
order.returninfo=req.body.status
if(req.body.status==='Approved'){
  const user=await User.findById(order.customer)
  order.orderStatus='Returned'
  user.Wallet+=order.totalAmount
  await user.save()
  let product={}
  for (const val of order.products) {
   product = await Product.findById(val.product);
   product.stock+=val.quantity
  }
  await product.save()
}

await order.save()
res.redirect('/admin/orders')
} catch (error) {
  console.log(error);
}
}
let report=[]
const reportload = async (req, res) => {
  try {
    let filters = {orderStatus:'Delivered'};

   
    const timeFilter = req.query.time;
    if (timeFilter === 'Custom') {
     
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      if (startDate && endDate) {
        filters.orderDate = {
          $gte: new Date(startDate),
          $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)), // Add 1 day to include the end date
        };
      }
    } else if (timeFilter) {
    
      switch (timeFilter) {
        case 'Today':
          filters.orderDate = {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999)),
          };
          break;
        case 'This month':
          filters.orderDate = {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999),
          };
          break;
        case 'This year':
          filters.orderDate = {
            $gte: new Date(new Date().getFullYear(), 0, 1),
            $lt: new Date(new Date().getFullYear() + 1, 0, 0, 23, 59, 59, 999),
          };
          break;
        default:
          break;
      }
    }

    // Fetch orders based on the applied filters
    const orders = await Order.find(filters).populate('customer').populate('products.product');
    report=orders
    res.render('admin/report', { orders });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};







module.exports={ordersLoad,ordersChange,singleOrder,returnApprove,reportload}