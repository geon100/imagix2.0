const User=require('../models/usermodel')
const Category=require('../models/categorymodel')
const Product=require('../models/productmodel')
const Banner=require('../models/bannermodel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Order = require('../models/ordermodel');
const {ObjectId}=require('mongodb')
const mongoose=require('mongoose')
const razorpay=require('../middlewares/Razorpay');
const { response } = require('express');
const dotenv=require('dotenv').config()
const Coupon=require('../models/couponmodel')
const PDFDocument = require('pdfkit');
const fs = require('fs');

let crederror=false
let otp=0


const loadhome=async(req,res)=>{
   try {
     
      const prods1=await Product.find({isActive:true,isDelete:false}).limit(8).lean()
      const prods2=await Product.find({isActive:true,isDelete:false}).skip(8).limit(8).lean()
      const cat=await Category.find({isActive:true}).lean()
      const banner=await Banner.findOne({isActive:true})
      if(req.session.user)
         res.render('users/home',{user:req.session.user,prods1,prods2,cat,banner})
      else
         res.render('users/home',{prods1,prods2,cat,banner})
   } catch (error) {
      console.log(error.message)
      res.status(500).redirect('/serverError')
   }
 }
   
 

 
 const loadRegister = async(req,res)=>{
  try {
     
     res.render('users/register',{message:'',errMessage:''})

  } catch (error) {
     console.log(error.message)
     res.status(500).redirect('/serverError')
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
     res.status(500).redirect('/serverError')
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
     res.status(500).redirect('/serverError')
  }
}

const verfiyUser = async(req,res)=>{
   try {
      const email = req.body.username;
      const password = req.body.password;

      const userData = await User.findOne({email:email});
      console.log(req.body)
      if(userData){
         if(!userData.isActive){
            res.redirect('/userBlocked');
            return
         }
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
      res.status(500).redirect('/serverError')
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
     from: 'noreply@gmail.com',
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
      res.status(500).redirect('/serverError')
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
      res.status(500).redirect('/serverError')
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
      res.status(500).redirect('/serverError')
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
      res.status(500).redirect('/serverError')
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
   const filter = { isActive:true,isDelete:false };

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
      res.status(500).redirect('/serverError')
   }
 };
 const Prodsearch=async (req, res) => {
   res.redirect(`/search?search=${req.body.searchinput}`)
 }

 const searchload=async (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const searchQuery=req.query.search
   const filter = { isActive:true,isDelete:false };
   if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      filter.$or = [
        { name: { $regex: regex } },
        { brand: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }
   prods = await Product.find(filter)
   //  .sort({ salePrice: sort })
   .skip((page - 1) * 6)
   .limit(6)
   .lean();

   let remain = await Product.countDocuments(filter);
   remain -= page * 6;

   res.render('users/prodsearch',{user: req.session.user,prods,cp:page,remain,searchQuery})
 }
 
 

const showProdDetails=async (req, res) => {
   try {
   let reviewPossible=false
   const prod=await Product.findById(req.query.id).populate('reviews.userid')
   const cat=await Category.findById(prod.category)
   const order=await Order.findOne({'customer': req.session.user._id, 'products.product': req.query.id, 'orderStatus': { $in: ['Pending', 'Processing', 'Shipped', 'Delivered','Returned'] }  })
   const reviewExist=await Product.findOne({ _id: req.query.id, 'reviews.userid': req.session.user._id });
      if(order && !reviewExist){
         reviewPossible=true
      }
   
   res.render('users/singleproduct',{prod,cat,user:req.session.user,reviewPossible})
   } catch (error) {
      console.log(error.message);
      res.status(500).redirect('/serverError')
   }
}
const addReview=async (req, res) => {
   const {rating,description,productId}=req.body
   const review ={
      rating:rating,
      description:description,
      userid: req.session.user._id,
    }
    
    const product = await Product.findById(productId);
    product.reviews.push(review);
    await product.save();
    res.redirect(`/productdetails?id=${productId}`)
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
      res.status(500).redirect('/serverError')
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
      res.status(500).redirect('/serverError')
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
      res.status(500).redirect('/serverError')
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
      res.status(500).redirect('/serverError')
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
      res.status(500).redirect('/serverError')
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
      res.status(500).redirect('/serverError')
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
      res.status(500).redirect('/serverError')
      
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
      res.status(500).redirect('/serverError')
      
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
      res.status(500).redirect('/serverError')
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
      res.status(500).redirect('/serverError')
   }
}
const editAdddress=async(req,res)=>{
   res.redirect(`/profile?tab=address&addr=edit&i=${req.query.i}`);
 };

 
 const upbasic=async(req,res)=>{
   try {
      const user = await User.findById(req.session.user._id);
    
      
      const emailChanged = user.email !== req.body.editEmail;
    
      if (emailChanged) {
        
        const existingUser = await User.findOne({ email: req.body.editEmail });
        if (existingUser) {
          
          return res.redirect('/profile?addr=BInfo');
        }
      }
    
     
      user.firstname = req.body.editFirstName;
      user.lastname = req.body.editLastName;
      user.email = req.body.editEmail;
      user.mobile = req.body.editMobile;
    
      await user.save();
      res.redirect('/profile');
    } catch (error) {
      // Handle errors here
      console.error(error);
      res.status(500).redirect('/serverError')
    }
 }
//checkout

const checkoutLoad=async(req,res)=>{
   try {
      let coupons=null
      const user=await User.findById(req.session.user._id)
      if (req.query.coupon) {
         console.log(req.query.coupon);
         coupons=await Coupon.findById(req.query.coupon)
      } else {
         coupons = await Coupon.find({ isActive: true, appliedUsers: { $nin: [user._id] } });
      }
      
   const prods=[]
   let gTotal=0,discount=0
   for (const val of user.cart) {
      const product = await Product.findById(val.id);
      if(product.stock===0)
      continue;

      product.quantity = val.quantity;
      prods.push(product);
      gTotal+=product.quantity*product.salePrice
    }
    if(req.query.coupon){
      discount=(gTotal * (coupons.discountPercent / 100)).toFixed(2);
      discount=discount<coupons.maxDiscount?discount:coupons.maxDiscount
      gTotal-=discount
    }
   
   if(prods.length===0){
      res.redirect('/cart')
   }else
   res.render('users/checkout',{user,prods,gTotal,coupons,discount})
   } catch (error) {
      console.log(error.message);
      res.status(500).redirect('/serverError')
   }
}

const placeorder=async(req,res)=>{
   try {
       
      const user=await User.findById(req.session.user._id)
   const prods=[]
   if(req.body.appliedCoupon){
      const coupon=await Coupon.findById(req.body.appliedCoupon)
      coupon.appliedUsers.push(user._id)
      await coupon.save()
   }
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
   console.log(req.body.discount)
   const order=new Order({
      customer:user._id,
      products:prods,
      paymentMethod:req.body.payment,
      totalAmount:req.body.total,
      Address:req.body.selectedAddress,
      discount:req.body.discount||0
   })

   user.cart=[]
   if(req.body.payment==='Wallet'){
      user.Wallet-=req.body.total
      order.paymentStatus='Paid'
   }
   const newOrder=await order.save()
   await user.save()
      if(req.body.payment==='COD'||req.body.payment==='Wallet')
         res.json({codSuccess:true,id:newOrder._id})
      else{
         const order=await razorpay.rzpOrder(newOrder)
         res.json(order)
      }
   } catch (error) {
      console.log(error.message);
      res.status(500).redirect('/serverError')
   }
}
const orderDone = async (req, res) => {
  try {
   if (req.query.id) {
      const order=await Order.findById(req.query.id)

  res.render('users/ordersuccess',{order,user:req.session.user})
   } else {

  res.render('users/ordersuccess')
   }
   
  } catch (error) {
   console.log(error.message);
   res.status(500).redirect('/serverError')
  }
};
const verifypayment = async (req, res) => {
   try {
      console.log(req.body)
   const order=await razorpay.rzpVerify(req.body)

   if(order){
      res.json({status:true,id:order})
   }
   } catch (error) {
      res.status(500).redirect('/serverError')
   }
}
const orderview = async (req, res) => {
   try {
     const user = await User.findById(req.session.user._id);
     const order = await Order.findById(req.query.id).populate('products.product');
 
     // Check if the order is not found
     if (!order) {
       throw new Error('Order not found');
     }
 
     res.render('users/orderView', { order, user });
   } catch (error) {
     // Handle any errors here
     console.error(error);
     res.status(500).redirect('/serverError');
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
  if(order.paymentMethod==='online'||order.paymentMethod==='Wallet'){
   const user=await User.findById(order.customer)
   user.Wallet+=order.totalAmount
   await user.save()
  }
  await order.save()
  await product.save()
  res.redirect('/profile?tab=orders')
  } catch (error) {
   console.log(error.message)
   res.status(500).redirect('/serverError')
  }
}

const orderReturn=async(req,res)=>{
   console.log(req.body);
   const order=await Order.findById(req.body.id)
   order.return=true
   order.reason=req.body.reason
   order.returninfo='Pending'
   await order.save()
   res.json({status:true})
}

const orderInvoice = async (req, res) => {
   const orderId = req.query.id;
   const order = await Order.findById(req.query.id).populate('products.product');
 
   const doc = new PDFDocument();
 
   const stream = fs.createWriteStream('invoice.pdf');
   doc.pipe(stream);
   
   // Add content to the PDF
   doc

     .font('Helvetica-Bold')
     .fontSize(18)
     .text('Invoice', { align: 'center' })
     .moveDown()
     .fontSize(12)
     .text(`Invoice #: ${order.orderID} `)
     .moveDown()
     .text(`Order Date: ${order.orderDate}`)
     .moveDown()
     .text(`Delivered Date: ${order.deliveryDate}`)
     .moveDown();
 
   // Define table headers
   doc
     .font('Helvetica-Bold')
     .fontSize(12)
     .text('Product', 100, 200)
     .text('Qty', 250, 200)
     .text('Unit Price', 350, 200)
     .text('SubTotal', 450, 200);
 
   // Add table content
   let yPos = 230; // Vertical position for the first row
   order.products.forEach((product) => {
     const subtotal = product.salePrice * product.quantity;
     doc
       .font('Helvetica')
       .fontSize(12)
       .text(`${product.product.brand} ${product.product.name}`, 100, yPos)
       .text(product.quantity.toString(), 250, yPos)
       .text(`Rs. ${product.salePrice.toFixed(2)}`, 350, yPos)
       .text(`Rs. ${subtotal.toFixed(2)}`, 450, yPos);
     yPos += 20; // Move to the next row
   });
   doc.moveDown();
   doc.text('Address:',100, 380)
   doc.moveDown();
   // Display the address
   const addressLines = order.Address.split('\n');
   addressLines.forEach((line, index) => {
     doc.text(line, 100, 400 + index * 20);
   });
 
   // Display the order status
   doc.text(`Order Status: ${order.orderStatus}`, 100, 400 + addressLines.length * 20 + 20);
   
   // Display the payment status
   doc.text(`Payment Status: ${order.paymentStatus}`, 100, 400 + addressLines.length * 20 + 40);
 
   // Display the discount and grand total
   doc.text(`Discount: Rs. ${order.discount.toFixed(2)}`, 100, 440 + addressLines.length * 20 + 20);
   doc
   .font('Helvetica-Bold')
     .fontSize(18)
   .text(`Grand Total: Rs. ${order.totalAmount.toFixed(2)}`, 100, 450 + addressLines.length * 20 + 40);
 
   // Finalize the PDF
   doc.end();
 
   // Set response headers for downloading the PDF
   res.setHeader('Content-Type', 'application/pdf');
   res.setHeader('Content-Disposition', `attachment; filename=invoice_${order.orderID}.pdf`);
 
   // Pipe the PDF to the response object
   doc.pipe(res);
 };
 

 


module.exports={loadhome,loadRegister,loadLogin,logoutUser,insertUser,verfiyUser,otpFunc,verifyOtp,forgotLoad,verifyForgot,
                showProducts,showProdDetails,Prodsearch,searchload,cartLoad,addToCart,upCart,cartDel,profileLoad,addAddress,
                delAdddress,editAdddress,checkoutLoad,placeorder,orderCancel,orderDone,orderview,loadWish,addWish,delWish,saveAddr,
                upbasic,verifypayment,orderReturn,orderInvoice,addReview}