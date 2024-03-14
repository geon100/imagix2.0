const Coupon=require('../models/couponmodel') // Importing Coupon model
const voucher = require('voucher-code-generator'); // Importing voucher-code-generator library

// Function to load the coupon listing page
const couponLoad=async(req,res)=>{
  // Fetching all coupons from the database
  let coupons=await Coupon.find()
  // Rendering the coupon listing page with fetched coupons
  res.render('admin/coupons',{coupons})
}

// Function to generate a unique coupon code
const generateCode=async(req,res)=>{
  // Generating a unique coupon code using voucher-code-generator library
  const uniqueCouponCode = voucher.generate({
    length: 8,          // Length of the coupon code
    count: 1,           // Number of coupon codes to generate
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',    // Character set for the coupon code
    prefix: 'COU',      // Prefix for the coupon code
    unique: true        // Ensuring uniqueness of the generated code
  });
  // Sending the generated coupon code as a JSON response
  res.json({code:uniqueCouponCode[0]})
}

// Function to add a new coupon
const addcoupon=async(req,res)=>{
  // Creating a new coupon object with data from the request body
  const coupon=new Coupon({
    code:req.body.code,
    description:req.body.info,
    discountPercent:req.body.discountPercent,
    minPurchase:req.body.minPurchase,
    maxDiscount:req.body.maxDiscount,
  })
  // Saving the new coupon to the database
  await coupon.save()
  // Sending a JSON response indicating success
  res.json({data:true})
}

// Function to activate/deactivate a coupon
const changeCouponStatus=async(req,res)=>{
  // Extracting the coupon ID from the request query
  const couponId=req.query.id
  // Finding the coupon by ID and toggling its isActive status
  const coupon=await Coupon.findById(couponId)
  coupon.isActive=!coupon.isActive
  await coupon.save()
  // Sending a JSON response indicating success
  res.json(true)
}

module.exports={couponLoad,generateCode,addcoupon,changeCouponStatus}
