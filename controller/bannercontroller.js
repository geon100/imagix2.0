const Banner=require('../models/bannermodel') // Importing Banner model

// Function to render banner list page
const bannerList=async(req,res)=>{
  // Fetching all banners from the database
  const banners=await Banner.find()
  // Rendering the banner list page with fetched banners
  res.render('admin/banners',{banners})
}

// Function to add a new banner
const addBanner=async(req,res)=>{
  // Extracting title, description, and image from request body
  const {title,description}=req.body
  const img=req.file.filename

  // Creating a new banner object
  const banner=new Banner({
    title:title,
    description:description,
    image:img
  })
  // Saving the new banner to the database
  await banner.save()
  // Redirecting to the banner list page after adding the banner
  res.redirect('/admin/banners')
}

// Function to change the status of a banner
const changeBannerStatus = async (req, res) => {
  try {
    // Fetching all banners from the database
    const banners = await Banner.find();
    // Finding the banner to activate based on the provided ID
    const bannerToActivate = banners.find(banner => banner._id.toString() === req.query.id);

    // Activating the selected banner and deactivating others
    if (bannerToActivate) {
      banners.forEach(async (banner) => {
        banner.isActive = banner._id.toString() === req.query.id;
        await banner.save();
      });
    }

    // Sending a JSON response indicating success
    res.json(true)
  } catch (error) {
    // Handling errors and redirecting to an error page
    console.error(error);
    res.status(500).redirect('/serverError');
  }
};

// Exporting all functions as a module
module.exports={bannerList,addBanner,changeBannerStatus}
