const User=require('../models/usermodel')
const Category=require('../models/categorymodel')
const Product=require('../models/productmodel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
;
const dotenv=require('dotenv').config()


let crederror=false
let otp=0

const loadhome=async(req,res)=>{
   const prods1=await Product.find({isDelete:false}).limit(8).lean()
   const prods2=await Product.find({isDelete:false}).skip(8).limit(8).lean()
   const cat=await Category.find({isActive:true}).lean()

   if(req.session.user)
      res.render('users/home',{user:req.session.user,prods1,prods2,cat})
   else
      res.render('users/home',{prods1,prods2,cat})
   
   
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
   const userData = await User.findOne({email:req.body.username});
      
   if(userData && userData.isActive){
   
   otp = generateOtp() 
   
   const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
          user: 'imagixtestmail@gmail.com',
          pass: 'ftnhgyrhifxuditw'
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
       res.render('users/otp',{uid:userData._id}); 
     }
   });
}else{
   crederror=true
   res.redirect('/login');
}
 };

 const verifyOtp=async (req, res) => {
   
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
}
//user logout
const logoutUser=async (req, res) => {
   req.session.user=undefined
   res.redirect('/')
}
//Product display on user-side
const showProducts=async (req, res) => {
   const page = parseInt(req.query.page) || 1; 
   
   const cat=await Category.find({isActive:true}).lean()
   const brand=await Product.distinct('brand',{isDelete:false})

   const prods= await Product.find({isDelete:false}).skip((page-1)*6).limit(6).lean()
   let remain= await Product.countDocuments({ isDelete: false })
   remain-=(page*6)
   console.log(remain)
   res.render('users/allproducts',{user:req.session.user,cat,brand,prods,cp:page,remain})
 }

const showProdDetails=async (req, res) => {
   
   const prod=await Product.findById(req.query.id)
   const cat=await Category.findById(prod.category)
   res.render('users/singleproduct',{prod,cat,user:req.session.user})
}


module.exports={loadhome,loadRegister,logoutUser,insertUser,loadLogin,verfiyUser,otpFunc,verifyOtp,showProducts,showProdDetails}