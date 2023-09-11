const Product = require('../models/productmodel')
const Category=require('../models/categorymodel')

const cropImg=require('../middlewares/sharp');

let crederror=false,success=false// flags

const loadPro=async(req,res)=>{
  const page = parseInt(req.query.page) || 1;
  const product=await Product.find({isDelete:false}).skip((page-1)*5).limit(5).lean()
  const prods=[]
  for(let prod of product){
     cat=await Category.find({_id:prod.category},{name:1})
     console.log(cat);
     prod.category=cat[0]
     prods.push(prod)
  }
  let remain= await Product.countDocuments({ isDelete: false })
  remain-=(page*5)
  
  res.render('admin/productlist',{prods,search:false,cp:page,remain})
  
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
 const img=[]
 for(i=0;i<req.files.length;i++){
   img.push(req.files[i].filename)
 }
 let product=new Product({
  name:req.body.name,
  description:req.body.description,
  brand:req.body.brand.toUpperCase(),
  category:req.body.category,
  stock:req.body.stock,
  regularPrice:req.body.rprice,
  salePrice:req.body.sprice,
  
  images:img
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
  
  let product=await Product.findById(req.params.id)
  
     
     product.name=req.body.name
     product.description=req.body.description
     product.brand=req.body.brand.toUpperCase()
     product.category=req.body.category
     product.stock=req.body.stock
     product.regularPrice=req.body.rprice
     product.salePrice=req.body.sprice
       
   if(req.files.length!=0){
     await cropImg.crop(req)
     const img=[]
     for(i=0;i<req.files.length;i++){
      img.push(req.files[i].filename)
    }
    for(i=0;i<3-product.images.length;i++){
      product.images.push(img.shift())
    }
    img.forEach((img, index) => {
      product.images[index] = img;
  });
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

module.exports={loadPro,addproView,addPro,prodel,prosearch,editprod,upProd}