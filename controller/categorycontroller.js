const Category=require('../models/categorymodel')
const Product = require('../models/productmodel')

let crederror=false

const loadCat=async(req,res)=>{
  const cat=await Category.find().lean()
  if(crederror===true){
     crederror=false
     res.render('admin/category',{message:"Category already exist",cat});
   }
   else
  res.render('admin/category',{cat,message:''})
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
const blockCat = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    cat.isActive = !cat.isActive;

    // Find all products in the category and update their isActive status
    const products = await Product.find({ category: cat._id });

    // Update isActive for each product and save it
    for (const product of products) {
      product.isActive = !product.isActive;
      await product.save();
    }

    // Save the updated category
    await cat.save();

    res.redirect('/admin/category');
  } catch (error) {
    // Handle any errors here
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


const loadEdit=async(req,res)=>{
  console.log(req.query.id)
  const cat=await Category.findById(req.query.id)
  if(crederror===true){
    crederror=false
    res.render('admin/editcategory',{message:"Category already exist",cat});
  }
  else
  res.render('admin/editcategory',{cat,message:''})
}
const upCat=async(req,res)=>{
  const cat=await Category.find({name:req.body.categoryName.toUpperCase()})
  console.log(cat);
  if(cat.length===0){
    console.log('here');
  const str=req.body.categoryName.toUpperCase()
  const cat=await Category.findById(req.body.id)
  cat.name=str
  await cat.save()
  }else{

  console.log('here');
     crederror=true
     res.redirect(`/admin/editcategory?id=${req.body.id}`)
     return
  }
  res.redirect('/admin/category')
}

module.exports={loadCat,addCat,blockCat,loadEdit,upCat}