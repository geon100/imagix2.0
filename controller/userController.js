const User=require('../models/usermodel')
const Category=require('../models/categorymodel')
const Product=require('../models/productmodel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Order = require('../models/ordermodel');
const {ObjectId}=require('mongodb')
const mongoose=require('mongoose')
const razorpay=require('../middlewares/Razorpay')
const dotenv=require('dotenv').config()

 
let crederror=false
let otp=0


const loadhome=async(req,res)=>{
   try {
     
      const prods1=await Product.find({isDelete:false}).limit(8).lean()
      const prods2=await Product.find({isDelete:false}).skip(8).limit(8).lean()
      const cat=await Category.find({isActive:true}).lean()

      if(req.session.user)
         res.render('users/home',{user:req.session.user,prods1,prods2,cat})
      else
         res.render('users/home',{prods1,prods2,cat})
   } catch (error) {
      console.log(error.message)
   }
 }
   
 

 
 const loadRegister = async(req,res)=>{
  try {
     
     res.render('users/register',{message:'',errMessage:''})

  } catch (error) {
     console.log(error.message)
  }
}

const insertUser = async (req, res) => {
   try {
     const email = req.body.email;
     const checkWithemail = await User.findOne({ email: email });
     const checkWithmobile = await User.findOne({ mobile: req.body.mobile });
 
     if (checkWithemail || checkWithmobile) {
       return res.render('users/register', { errMessage: 'User already exists', message: '' });
     }
 
     // Hash the password
     bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
       if (err) {
         console.error('Error hashing password:', err);
         return res.status(500).send('Internal Server Error');
       }
 
       try {
         const user = new User({
           firstname: req.body.firstname,
           lastname: req.body.lastname,
           email: req.body.email,
           password: hashedPassword,
           mobile: req.body.mobile
         });
 
         const userData = await user.save();
 
         if (userData) {
           return res.render('users/register', { message: 'Registration Successful! Please Login Now', errMessage: '' });
         }
       } catch (error) {
         console.log(error.message);
         return res.status(500).send('Internal Server Error');
       }
     });
   } catch (error) {
     console.log(error.message);
     return res.status(500).send('Internal Server Error');
   }
 };
 
const loadLogin = async(req,res)=>{
  try {  
   if(crederror===true){
      crederror=false
      res.render('users/login',{message:'',errMessage:'You have enter wrong credentials or You have been Blocked by the Admin'})
    }
    else
    res.render('users/login',{message:'',errMessage:''});
  }
  catch (error) {
     console.log(error.message);
  }
}

const verfiyUser = async(req,res)=>{
   try {
      const email = req.body.username;
      const password = req.body.password;

      const userData = await User.findOne({email:email});
      console.log(req.body)
      if(userData && userData.isActive){
         if(await bcrypt.compare(password,userData.password)){
            
            req.session.user = userData
            
            res.redirect('/')
         }else{
            crederror=true
            res.redirect('/login');
         }
      }else{
         crederror=true
         res.redirect('/login');
      }

   } catch (error) {
      console.log(error.message)
   }
}

//otp generator
function generateOtp(){
   return Math.floor(1000 + Math.random() * 9000);
}
//otp-login
const otpFunc = async (req, res) => {

   try {
     
      const userData = await User.findOne({email:req.body.username});
      
   if(userData && userData.isActive){
   
   otp = generateOtp() 
   if(req.query.forgot){
      req.session.temp=req.body.npassword
   }
   const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
          user: process.env.MAIL,
          pass: process.env.PASS
      }
  });
 
   const mailOptions = {
     from: 'test@imagix.com',
     to: req.body.username,
     subject: 'Your OTP',
     text: `Your OTP is: ${otp}`
   };
 
   transporter.sendMail(mailOptions, (error, info) => {
     if (error) {
       console.error('Error sending email:', error);
       res.redirect('/login'); 
     } else {
       console.log('Email sent:', info.response);
       if(req.query.forgot){
         res.render('users/otp',{uid:userData._id,forget:true}); 
         console.log(otp)
      }else
       res.render('users/otp',{uid:userData._id,forget:false}); 
     }
   });
}else{
   crederror=true
   if(req.query.forgot){
      res.redirect('/forgot-password');
   }else
   res.redirect('/login');
   
}
 
   } catch (error) {
      console.log(error.message)
   }
 }
   
 

 const verifyOtp=async (req, res) => {
   
   try{
      if(req.body.otp===String(otp)){
         userData=await User.findById({_id:req.body.uid});
            if(userData){
               req.session.user = userData
               console.log(userData.firstname);
               res.redirect('/')
            }else{
            crederror=true
            res.redirect('/login');
            }
         }else{
            crederror=true
            res.redirect('/login');
         } 
   }catch(error){
      console.log(error.message)
   }
}
const forgotLoad=async (req, res) => {
   try {
      if(crederror===true){
         crederror=false
         res.render('users/forgotpassword',{errMessage:'Invalid username or otp',message:''})
       }
       else
       res.render('users/forgotpassword',{errMessage:'',message:''})
   } catch (error) {
      console.log(error.message)
   }
   
}
const verifyForgot=async (req, res) => {
   try {
      if(req.body.otp===String(otp)){
         userData=await User.findById({_id:req.body.uid});
            if(userData){
               console.log(req.session.temp)
               const hashedpassword=await bcrypt.hash(req.session.temp, 10)
               userData.password=hashedpassword
               await userData.save()
               res.redirect('/login')
            }else{
            req.session.temp=undefined
            crederror=true
            res.redirect('/forgot-password');
            }
         }else{
            req.session.temp=undefined
            crederror=true
            res.redirect('/forgot-password');
         } 
   } catch (error) {
      console.log(error.message)
      
   }
   }



//user logout
const logoutUser=async (req, res) => {
   req.session.user=undefined
   res.redirect('/')
}
//Product display on user-side
const showProducts = async (req, res) => {
   try {
      const page = parseInt(req.query.page) || 1;
   const sort = parseInt(req.query.sort);
 
   // Parse category and brand filters from query parameters
   const categoryFilter = req.query.category || '';
   const brandFilter = req.query.brand || '';
   console.log(req.query)
   let prods = [];
 
   // Construct the filter object based on user selections
   const filter = { isDelete: false };

if (categoryFilter) {
  filter.category = categoryFilter;
}

if (brandFilter) {
  filter.brand = brandFilter;
}

if (sort === 1 || sort === -1) {
  prods = await Product.find(filter)
    .sort({ salePrice: sort })
    .skip((page - 1) * 6)
    .limit(6)
    .lean();
} else if (sort === 2) {
  prods = await Product.find(filter)
    .sort({ brand: 1 })
    .skip((page - 1) * 6)
    .limit(6)
    .lean();
} else {
  prods = await Product.find(filter)
    .skip((page - 1) * 6)
    .limit(6)
    .lean();
}

   const cat = await Category.find({ isActive: true }).lean();
   const brandList = await Product.distinct('brand', { isDelete: false });
 
   let remain = await Product.countDocuments(filter);
   remain -= page * 6;
 
   res.render('users/allproducts', {
     user: req.session.user,
     cat,
     brand: brandList,
     prods,
     cp: page,
     remain,
     sort,
     categoryFilter,
     brandFilter
   });
   } catch (error) {
      console.log(error.message);
   }
 };
 

const showProdDetails=async (req, res) => {
   try {
      const prod=await Product.findById(req.query.id)
   const cat=await Category.findById(prod.category)
   res.render('users/singleproduct',{prod,cat,user:req.session.user})
   } catch (error) {
      console.log(error.message);
   }
}
//cart operations
const cartLoad=async(req,res)=>{
   try {
      const user=await User.findById(req.session.user._id)
   const prods=[]
   let gtotal=0
   for (const val of user.cart) {
      const product = await Product.findById(val.id);
      product.quantity = val.quantity;
      prods.push(product);
      gtotal+=product.salePrice*val.quantity
    }

   res.render('users/cart',{prods,user,gtotal})
   } catch (error) {
      console.log(error.message);
   }
}

const addToCart=async(req,res)=>{
   try {
      const user=await User.findById(req.session.user._id)
   const product=await Product.findById(req.body.id)
   let cart={
      id:req.body.id,
      quantity:parseInt(req.body.qty)||1
   }
  
   if(user.cart.length!=0){
      user.cart.forEach(val => {
         if(val.id===cart.id){
            
         val.quantity+=cart.quantity
         if(val.quantity>product.stock)
         val.quantity=product.stock
         cart=null
         }
      });
   }
   console.log(user.cart)
   if(cart){
      user.cart.push(cart)
   }
   await user.save()
   if(req.body.qty)
      res.redirect(`/productdetails?id=${req.body.id}`)
   else
      res.redirect('/cart')
   
   } catch (error) {
      console.log(error.message);
   }
}
const cartDel=async(req,res)=>{
   try {
      const user=await User.findById(req.session.user._id)
    console.log(req.params.id)
   if(req.params.id){
      user.cart=user.cart.filter(val=> val.id!=req.params.id)
      // user.cart=user.cart.filter(val=>val!=null)
      console.log(user.cart)
      await user.save()
   }
   res.redirect('/cart')
   } catch (error) {
      console.log(error.message);
   }
}

const upCart=async(req,res)=>{
   try {
      const user= await User.findById(req.session.user._id)
   user.cart.forEach(val=>{
      if(val.id.toString()==req.body.proId.toString()){
         console.log(val)
         val.quantity=parseInt(req.body.quantity)
      }
   })
   await user.save()
   res.json({status:true})
   } catch (error) {
      console.log(error.message);
   }
}

//WISHLIST


const loadWish=async(req,res)=>{
   try {
      const user= await User.findById(req.session.user._id)
   const prods=[]
   for (const val of user.wishlist) {
   const product=await Product.findById(val)
   prods.push(product)
   }
   res.render('users/wishlist',{prods,user})
   } catch (error) {
      console.log(error.message);
   }
}
const addWish=async(req,res)=>{
   try {
      const user= await User.findById(req.session.user._id)
   if(user.wishlist.includes(req.query.id)|| !req.query.id){
      res.redirect(`/productdetails?id=${req.query.id}`)
   }else{
      user.wishlist.push(req.query.id)
      await user.save()
      res.redirect('/wishlist')
   }
   } catch (error) {
      console.log(error.message);
   }
}

const delWish=async(req,res)=>{
   try {
      const user= await User.findById(req.session.user._id)
      if(req.query.id){
         user.wishlist=user.wishlist.filter(val=>val!=req.query.id)
         await user.save()
         res.redirect('/wishlist')
      }else{
         res.redirect('/')
      }
   } catch (error) {
      console.log(error.message);
      
   }
}
// userprofile
const profileLoad=async(req,res)=>{
   try {
   const user=await User.findById(req.session.user._id)
   const orders=await Order.find({customer:user._id}).populate('products.product').sort({orderDate:-1})
   if(req.query.addr){
      const address=user.address[parseInt(req.query.i)]
      res.render('users/profile',{user,orders,address,addr:req.query.addr,i:parseInt(req.query.i)})
   }else
   res.render('users/profile',{user,orders,addr:'',i:null})
   } catch (error) {
      console.log(error.message);
      
   }
}

const addAddress=async(req,res)=>{
   try {
      const user=await User.findById(req.session.user._id)
   if(user){
      const addr={
         name:`${req.body.fname} ${req.body.lname}`,
         mobile:req.body.number,
         email:req.body.email,
         fullAddress:`${req.body.addr1},${req.body.addr2}`,
         city:req.body.city,
         district:req.body.district,
         pincode:req.body.pincode
      }
      user.address.push(addr)
      await user.save()

      if(parseInt(req.query.checkout)===1)
      res.redirect('/checkout')
      else
      res.redirect('/profile?tab=address')
   }
   } catch (error) {
      console.log(error.message);
      
   }
}


const saveAddr=async(req,res)=>{
   try {
   const user=await User.findById(req.session.user._id)
   const address=user.address[parseInt(req.query.i)]
   address.name=req.body.name
   address.number=req.body.number
   address.email=req.body.email
   address.fullAddress=req.body.addr
   address.city=req.body.city
   address.district=req.body.district
   address.pincode=req.body.pincode
   
   await User.findByIdAndUpdate(req.session.user._id, user);
   
   res.redirect('/profile?tab=address')
   } catch (error) {
      res.send('error')
   }
}


const delAdddress=async(req,res)=>{
   try {
      console.log(req.body.i)
   const user=await User.findById(req.session.user._id)
   user.address[parseInt(req.body.i)]=null
   user.address=user.address.filter((val)=> val!==null)
   await user.save()
   res.redirect('/profile?tab=address')
   } catch (error) {
      console.log(error.message);
      
   }
}
const editAdddress=async(req,res)=>{
   res.redirect(`/profile?tab=address&addr=edit&i=${req.query.i}`);
 };

 
 const upbasic=async(req,res)=>{
   try {
      const existingUser=await User.find({email:req.body.editEmail})
      if(existingUser){
         res.redirect('/profile?addr=BInfo')
      }else{
      const user=await User.findById(req.session.user._id)
      console.log(req.body)
      user.firstname=req.body.editFirstName
      user.lastname=req.body.editLastName
      user.email=req.body.editEmail
      user.mobile=req.body.editMobile

      await user.save()
      res.redirect('/profile')
   }
   } catch (error) {
      
   }
 }
//checkout

const checkoutLoad=async(req,res)=>{
   try {
      const user=await User.findById(req.session.user._id)
   const prods=[]
   let gTotal=0
   for (const val of user.cart) {
      const product = await Product.findById(val.id);
      if(product.stock===0)
      continue;

      product.quantity = val.quantity;
      prods.push(product);
      gTotal+=product.quantity*product.salePrice
    }
    
   
   if(prods.length===0){
      res.redirect('/cart')
   }else
   res.render('users/checkout',{user,prods,gTotal})
   } catch (error) {
      console.log(error.message);
      
   }
}

const placeorder=async(req,res)=>{
   try {
      const user=await User.findById(req.session.user._id)
   const prods=[]
   let gTotal=0
   for (const val of user.cart) {
      const product = await Product.findById(val.id);
      if(product.stock===0)
      continue;
         const productWithQuantity = {
            product: product._id,
            salePrice: product.salePrice,
            quantity: val.quantity,
         };
         product.stock-=val.quantity
         await product.save()
         prods.push(productWithQuantity);
   }
   console.log(prods)
   const order=new Order({
      customer:user._id,
      products:prods,
      paymentMethod:req.body.payment,
      totalAmount:req.body.total,
      Address:req.body.selectedAddress
   })

   const newOrder=await order.save()
   user.cart=[]
   await user.save()
      if(req.body.payment='COD')
         res.render('users/ordersuccess',{order:newOrder})
      else{
         paymentOrder=razorpay.rzpOrder(newOrder)

      }
   } catch (error) {
      console.log(error.message);
   }
}

const orderview = async (req, res) => {
   try {
      // Use $match to filter orders for a specific customer
      // let order= await Order.aggregate([
      //    { $match: { customer: new mongoose.Types.ObjectId(req.session.user._id) ,_id:new mongoose.Types.ObjectId(req.query.id)} },
      //    {
      //       $lookup: {
      //          from: 'Product', // Assuming your product collection is named 'products'
      //          localField: 'products.product',
      //          foreignField: '_id',
      //          as: 'productInfo'
      //       }
      //    },

      // ]).exec()
      const user=await User.findById(req.session.user._id)
      const order=await Order.findById(req.query.id).populate('products.product')
      
      res.render('users/orderView',{order,user})
   } catch (error) {
      // Handle any errors here
      console.error(error);
      res.status(500).send('Internal Server Error');
   }
};


const orderCancel=async(req,res)=>{
  try {
   console.log(req.query.id)
  const order=await Order.findById(req.query.id)
  let product={}
  for (const val of order.products) {
   product = await Product.findById(val.product);
   product.stock+=val.quantity
   
  }
  order.orderStatus='Cancelled'
  await order.save()
  await product.save()
  res.redirect('/profile?tab=orders')
  } catch (error) {
   console.log(error.message)
  }
}

module.exports={loadhome,loadRegister,loadLogin,logoutUser,insertUser,verfiyUser,otpFunc,verifyOtp,forgotLoad,verifyForgot,
                showProducts,showProdDetails,cartLoad,addToCart,upCart,cartDel,profileLoad,addAddress,delAdddress,editAdddress,checkoutLoad,
                placeorder,orderCancel,orderview,loadWish,addWish,delWish,saveAddr,upbasic}