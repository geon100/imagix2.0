const Category=require('../models/categorymodel') // Importing Category model
const Product = require('../models/productmodel') // Importing Product model

let crederror=false // Flag to handle credential errors

// Function to load the category listing page
const loadCat=async(req,res)=>{
  // Fetching all categories from the database
  const cat=await Category.find().lean()
  // Rendering the category listing page with fetched categories
  if(crederror===true){
     crederror=false
     res.render('admin/category',{message:"Category already exists", cat});
   }
   else
  res.render('admin/category',{cat, message:''})
}

// Function to add a new category
const addCat=async(req,res)=>{
  // Checking if the category already exists
  const cat=await Category.find({name:req.body.categoryName.toUpperCase()})
  if(cat.length===0){
    // Creating a new category object
    const str=req.body.categoryName.toUpperCase()
    const cat=new Category({name:str})
    // Saving the new category to the database
    await cat.save()
  } else {
    crederror=true
  }
  res.redirect('/admin/category')
}

// Function to block/unblock a category
const blockCat = async (req, res) => {
  try {
    // Finding the category by ID
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

    // Redirecting back to the category page
    res.redirect('/admin/category');
  } catch (error) {
    // Handle any errors here
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// Function to load the edit category page
const loadEdit=async(req,res)=>{
  // Finding the category by ID and rendering the edit category page with the category data
  const cat=await Category.findById(req.query.id)
  if(crederror===true){
    crederror=false
    res.render('admin/editcategory',{message:"Category already exists", cat});
  }
  else
  res.render('admin/editcategory',{cat, message:''})
}

// Function to update an existing category
const upCat=async(req,res)=>{
  // Checking if the updated category name already exists
  const cat=await Category.find({name:req.body.categoryName.toUpperCase()})
  if(cat.length===0){
    // Updating the existing category with the new name
    const str=req.body.categoryName.toUpperCase()
    const cat=await Category.findById(req.body.id)
    cat.name=str
    await cat.save()
  } else {
    crederror=true
    res.redirect(`/admin/editcategory?id=${req.body.id}`)
    return
  }
  res.redirect('/admin/category')
}

module.exports={loadCat,addCat,blockCat,loadEdit,upCat}
