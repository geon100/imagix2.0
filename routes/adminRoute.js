const express=require('express')
const router=express.Router()
const session = require('express-session');
const nocache = require('nocache')
const logger = require('morgan')

const {upload,banner}=require('../middlewares/multer')
const {isLogin,isLogout} = require('../middlewares/adminAuth')
const {loadLogin,verfiyUser,adminLogout,loadhome,loadUser,blockUser}=require('../controller/adminController');
const {loadPro,addproView,addPro,prodel,editprod,upProd,prosearch}=require('../controller/productcontroller')
const {loadCat,addCat,blockCat,loadEdit,upCat}=require('../controller/categorycontroller')
const {ordersLoad,ordersChange,singleOrder,returnApprove,reportload}=require('../controller/orderController')
const {couponLoad,generateCode,addcoupon,changeCouponStatus}=require('../controller/couponcontroller')
const {bannerList,addBanner,changeBannerStatus}=require('../controller/bannercontroller')
router.use(nocache())
router.use(session({
  secret: 'adminSecret',  
  saveUninitialized: true,
  resave: true
}))
router.use(logger('dev'))



//Admin login
router.get('/',isLogout,loadLogin)
router.post('/',verfiyUser)
router.get('/home',isLogin,loadhome)
router.get('/logout',adminLogout)

//user management
router.get('/users',isLogin,loadUser)
router.post('/users/:id',isLogin,blockUser)

//category management
router.get('/category',isLogin,loadCat)
router.post('/add-category',isLogin,addCat)
router.post('/category/:id',isLogin,blockCat)
router.get('/editcategory',isLogin,loadEdit)
router.post('/update-category',isLogin,upCat)

//product management
router.get('/products',isLogin,loadPro)
router.get('/add-product',isLogin,addproView)
router.post('/add-product',upload.array('images',3),addPro)
router.post('/delete/:id',isLogin,prodel)
router.post('/editproduct',isLogin,editprod)
router.post('/update-product/:id',upload.array('images',3),upProd)
router.post('/search',isLogin,prosearch)

// order management
router.get('/orders',isLogin,ordersLoad)
router.get('/orderview',isLogin,singleOrder)
router.post('/changeStatus',isLogin,ordersChange)
router.post('/returnStatus',isLogin,returnApprove)
//report
router.get('/report',isLogin,reportload)


//coupons
router.get('/coupons',isLogin,couponLoad)
router.get('/generateCode',isLogin,generateCode)
router.post('/addcoupon',isLogin,addcoupon)
router.patch('/changeCouponStatus',isLogin,changeCouponStatus)

//banner
router.get('/banners',isLogin,bannerList)
router.post('/addBanner',isLogin,banner.single('banner'),addBanner)
router.patch('/changeBannerStatus',isLogin,changeBannerStatus)

module.exports=router