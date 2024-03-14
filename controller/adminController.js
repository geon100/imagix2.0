const Admin=require('../models/adminmodel') // Importing Admin model
const User=require('../models/usermodel') // Importing User model
const Category=require('../models/categorymodel') // Importing Category model
const Order=require('../models/ordermodel') // Importing Order model
const Product=require('../models/productmodel') // Importing Product model

const bcrypt = require('bcrypt'); // Importing bcrypt for password hashing

let crederror=false // Flag to handle credential errors

// Function to load admin login page
const loadLogin = async(req,res)=>{
   try {  
      if(crederror===true){
         crederror=false
         res.render('admin/login',{message:"Invalid email or password"});
       }
       else
       res.render('admin/login',{message:''});
     }
 catch (error) {
     console.log(error.message);
  }
}

// Function to get order count for each status
async function Ordcount(){
   const orders = await Order.find({}); // Fetch all orders 

// Count orders by status
const orderCounts = {
  Delivered: 0,
  Pending: 0,
  Cancelled: 0,
  Returned: 0,
};

orders.forEach((order) => {
  switch (order.orderStatus) {
    case 'Delivered':
      orderCounts.Delivered++;
      break;
   
    case 'Cancelled':
      orderCounts.Cancelled++;
      break;
    case 'Returned':
      orderCounts.Returned++;
      break;
   default:
      orderCounts.Pending++;
      break;
  }
});
return orderCounts
}

// Function to get product count for each category
function categoryCount(products){
   
  const categoryCounts = {};

  products.forEach((product) => {
      const categoryName = product.category.name;
      if (categoryCounts[categoryName]) {
          categoryCounts[categoryName]++;
      } else {
          categoryCounts[categoryName] = 1;
      }
  });
  return categoryCounts
}

// Function to load admin home page
const loadhome = async(req,res)=>{
   try {
      const orders=await Order.find({ orderStatus: 'Delivered' }).sort({lastUpdated:-1})
      const revenue=orders.reduce((total, order) => {
         return total + order.totalAmount;
       }, 0);

       const products=await Product.find({isDelete:false}).populate('category')
       const category=await Category.find({isActive:true})
       const users=await User.find({isActive:true})
       const Ocount=await Ordcount()
       const Pcount=categoryCount(products)
       console.log(Pcount)
       res.render('admin/home',{orders,revenue,products,category,users,Ocount,Pcount})
   } catch (error) {
      console.log(error.message)
   }
}

// Function to verify admin login credentials
const verfiyUser = async(req,res)=>{
   try {
      const email = req.body.mail;
      const password = req.body.password;
      console.log(req.body)
      const userData = await Admin.findOne({email:email});
      if(userData){
         if(await bcrypt.compare(password,userData.password)){
            req.session.admin = userData
            res.redirect('/admin/home')
         }else{
            crederror=true
            res.redirect('/admin');
         }
      }else{
         crederror=true
         res.redirect('/admin');
      }

   } catch (error) {
      console.log(error.message)
   }
}

// Function to handle admin logout
const adminLogout= async(req,res)=>{
   try {
      req.session.admin=undefined
   res.redirect('/admin')
   } catch (error) {
      console.log(error);
   }
}

// Function to load user management page
const loadUser= async(req,res)=>{
   try {
      const users=await User.find({},{password:0}).lean()
      //console.log(users)
      res.render('admin/user',{users:users})
      

    } catch (error) {
       console.log(error.message)
    }
}

// Function to block/unblock user
const blockUser=async(req,res)=>{
try {
   const user=await User.findById(req.params.id)
   user.isActive = !user.isActive;
   await user.save();
   res.redirect('/admin/users')
} catch (error) {
   console.log(error);
}
}

// Exporting all functions as module
module.exports={loadLogin,verfiyUser,adminLogout,loadhome,loadUser,blockUser}
