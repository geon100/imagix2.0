const Admin=require('../models/adminmodel')
const User=require('../models/usermodel')
const Product = require('../models/productmodel')
const Category=require('../models/categorymodel')
const bcrypt = require('bcrypt');

const cropImg=require('../middlewares/sharp');
const fs=require('fs');
let crederror=false,success=false// flags

//admin login
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
//admin home
const loadhome = async(req,res)=>{
   try {
     res.render('admin/home')
   } catch (error) {
      console.log(error.message)
   }
}

//verify login
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

const adminLogout= async(req,res)=>{
   req.session.admin=undefined
   res.redirect('/admin')
}

//user management
const loadUser= async(req,res)=>{
   try {
      const users=await User.find({},{password:0}).lean()
      //console.log(users)
      res.render('admin/user',{users:users})
      

    } catch (error) {
       console.log(error.message)
    }
}


const blockUser=async(req,res)=>{
   const user=await User.findById(req.params.id)
   user.isActive = !user.isActive;
   await user.save();
   res.redirect('/admin/users')
}


//Category Management
const loadCat=async(req,res)=>{
   const cat=await Category.find().lean()
   if(crederror===true){
      crederror=false
      res.render('admin/category',{message:"Category already exist",cat});
    }
    else
   {
   res.render('admin/category',{cat,message:''})
   }
}


const addCat=async(req,res)=>{
   const cat=await Category.find({name:req.body.categoryName.toUpperCase()})
   console.log(cat);
   if(cat.length===0){
   const str=req.body.categoryName.toUpperCase()
   const cat=new Category({name:str})
   await cat.save()
   }else{
   console.log(cat);
      crederror=true
   }
   res.redirect('/admin/category')
}
const blockCat=async(req,res)=>{
   const cat=await Category.findById(req.params.id)
   cat.isActive = !cat.isActive;
   await cat.save();
   res.redirect('/admin/category')
}
//product management
const loadPro=async(req,res)=>{
   const product=await Product.find({isDelete:false}).lean()
   const prods=[]
   for(let prod of product){
      cat=await Category.find({_id:prod.category},{name:1})
      console.log(cat);
      prod.category=cat[0]
      prods.push(prod)
   }
   res.render('admin/productlist',{prods,search:false})
   
}

const addproView=async(req,res)=>{
   const cat=await Category.find({isActive:true},{name:1}).lean()
   if(crederror===true){
      crederror=false
      res.render('admin/addproduct',{cat,errmessage:'Error occured',message:''})
    }
    else if(success===true){
      success=false
      res.render('admin/addproduct',{cat,errmessage:'',message:'Success'})
    }else
    res.render('admin/addproduct',{cat,errmessage:'',message:''})
   
}

const addPro=async(req,res)=>{
  await cropImg.crop(req)
  let product=new Product({
   name:req.body.name,
   description:req.body.description,
   brand:req.body.brand.toUpperCase(),
   category:req.body.category,
   stock:req.body.stock,
   regularPrice:req.body.rprice,
   salePrice:req.body.sprice,
   images:[req.files[0].filename,req.files[1].filename,req.files[2].filename]
  })

  await product.save()
  success=true
  res.redirect('/admin/add-product')
}

const prodel=async(req,res)=>{
   const prod=await Product.findById(req.params.id)
   prod.isDelete = true;
   await prod.save();
   res.redirect('/admin/products')
}
const upProd=async(req,res)=>{
   console.log('HERE')
   let product=await Product.findById(req.params.id)
   if(req.files.length===0){
      
      product.name=req.body.name
      product.description=req.body.description
      product.brand=req.body.brand.toUpperCase()
      product.category=req.body.category
      product.stock=req.body.stock
      product.regularPrice=req.body.rprice
      product.salePrice=req.body.sprice
        
   }else{
      await cropImg.crop(req)
      product.name=req.body.name
      product.description=req.body.description
      product.brand=req.body.brand.toUpperCase()
      product.category=req.body.category
      product.stock=req.body.stock
      product.regularPrice=req.body.rprice
      product.salePrice=req.body.sprice
      product.images=[req.files[0].filename,req.files[1].filename,req.files[2].filename]
   }
   
  await product.save()
  
  res.redirect('/admin/products')
}
const editprod=async(req,res)=>{
   
   const prod=await Product.findById(req.body.id)
   const cat=await Category.find().lean()
   res.render('admin/editprod',{prod:prod,cat:cat,message:'',errmessage:''})
}

const prosearch=async(req,res)=>{
   const regex = new RegExp(`^${req.body.searchInput}`, 'i');
   //return await Product.find({ admin: false, firstname: regex }, { password: 0, admin: 0 });
   
   let sprod=await Product.find({ isDelete:false, name: regex });
   if(sprod.length===0){
      sprod=await Product.find({ isDelete:false, brand: regex });
   }
   const prods=[]
   for(let prod of sprod){
      cat=await Category.find({_id:prod.category},{name:1})
      console.log(cat);
      prod.category=cat[0]
      prods.push(prod)
   }
    res.render('admin/productlist',{prods,search:true})
}
   

module.exports={loadLogin,verfiyUser,adminLogout,loadhome,loadUser,blockUser,loadCat,addCat,blockCat,loadPro,addproView,addPro,prodel,prosearch,editprod,upProd}