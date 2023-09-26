const Banner=require('../models/bannermodel')

const bannerList=async(req,res)=>{
const banners=await Banner.find()
res.render('admin/banners',{banners})
}

const addBanner=async(req,res)=>{
const {title,description}=req.body
const img=req.file.filename

const banner=new Banner({
  title:title,
  description:description,
  image:img
})
await banner.save()
res.redirect('/admin/banners')

}


const changeBannerStatus = async (req, res) => {
  try {
    const banners = await Banner.find();
    const bannerToActivate = banners.find(banner => banner._id.toString() === req.query.id);

  
    if (bannerToActivate) {
      banners.forEach(async (banner) => {
        banner.isActive = banner._id.toString() === req.query.id;
        await banner.save();
      });
    }

    res.json(true)
  } catch (error) {
    console.error(error);
    res.status(500).redirect('/serverError');
  }
};


module.exports={bannerList,addBanner,changeBannerStatus}