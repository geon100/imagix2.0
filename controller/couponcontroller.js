const Coupon=require('../models/couponmodel')
const voucher = require('voucher-code-generator');
const { findById } = require('../models/productmodel');
//const moment = require('moment');


// const couponLoad=async(req,res)=>{}
const couponLoad=async(req,res)=>{
  let coupons=await Coupon.find()
  // const momentDate = moment(coupons[0].expirationDate);

  res.render('admin/coupons',{coupons})
}

const generateCode=async(req,res)=>{

  const uniqueCouponCode = voucher.generate({
    length: 8,          
    count: 1,           
    charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',    
    prefix: 'COU',  
    unique: true        
  });
  console.log(uniqueCouponCode[0])
  res.json({code:uniqueCouponCode[0]})
}

const addcoupon=async(req,res)=>{
  const coupon=new Coupon({
    code:req.body.code,
    description:req.body.info,
    discountPercent:req.body.discountPercent,
    minPurchase:req.body.minPurchase,
    maxDiscount:req.body.maxDiscount,
  })

  await coupon.save()
  res.json({data:true})
}

const changeCouponStatus=async(req,res)=>{
  const couponId=req.query.id
  console.log(couponId);
  const coupon=await Coupon.findById(couponId)
  coupon.isActive=!coupon.isActive
  await coupon.save()
  res.json(true)
}

module.exports={couponLoad,generateCode,addcoupon,changeCouponStatus}