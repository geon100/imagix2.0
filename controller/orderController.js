const Order=require('../models/ordermodel') // Importing Order model
const User=require('../models/usermodel') // Importing User model
const Product=require('../models/productmodel') // Importing Product model

// Function to load the order listing page
const ordersLoad=async(req,res)=>{
 try {
  // Fetching all orders from the database and populating associated customer and product details
  let orders=await Order.find().populate('customer').populate('products.product').sort({lastUpdated:-1})
  // Rendering the order listing page with fetched orders
  res.render('admin/orders',{orders})
 } catch (error) {
  console.log(error)
 }
}

// Function to change the status of an order
const ordersChange=async(req,res)=>{
  
  try {
    // Finding the order by ID
    const order=await Order.findById(req.body.id)
  order.orderStatus=req.body.orderStatus
  // Updating order details based on the new status
  if(order.orderStatus==='Delivered')
  {
    order.deliveryDate=Date.now()
    order.paymentStatus='Paid'
  } else if(order.orderStatus==='Cancelled'){
    // Restocking products if the order is cancelled
    let product={}
    for (const val of order.products) {
     product = await Product.findById(val.product);
     product.stock+=val.quantity
    }
    await product.save()
    // Refunding the user if the payment method is not COD
    if(order.paymentMethod!=='COD'){
      const user=await User.findById(order.customer)
      user.Wallet+=order.totalAmount
      await user.save()
    }
  }
  await order.save()
  // Redirecting back to the order listing page
  res.redirect('/admin/orders')
  } catch (error) {
    console.log(error);
  }
}

// Function to view details of a single order
const singleOrder=async(req,res)=>{
  try {
    // Finding the order by ID and populating associated customer and product details
    const order=await Order.findById(req.query.id).populate('customer').populate('products.product')
  // Rendering the single order view page with fetched order details
  res.render('admin/orderview',{order})
  } catch (error) {
    console.log(error);
  }
}

// Function to approve/disapprove return requests
const returnApprove=async(req,res)=>{
try {
  // Finding the order by ID
  const order=await Order.findById(req.body.id)
order.returninfo=req.body.status
// Handling return approval logic
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
// Redirecting back to the order listing page
res.redirect('/admin/orders')
} catch (error) {
  console.log(error);
}
}

// Function to load sales report page with filtered orders
const reportload = async (req, res) => {
  try {
    // Define initial filters
    let filters = {orderStatus:'Delivered'};

    // Apply time-based filters if specified
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
    // Render the sales report page with filtered orders
    res.render('admin/report', { orders });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// Exporting all functions as module
module.exports={ordersLoad,ordersChange,singleOrder,returnApprove,reportload}
