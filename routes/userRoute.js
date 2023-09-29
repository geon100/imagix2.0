const express=require('express')
const router=express.Router()
const session = require('express-session');
const nocache = require('nocache')
const logger = require('morgan')

const {isLogin,isLogout,checkCart} = require('../middlewares/userAuth')
const {loadhome,loadLogin,logoutUser,loadRegister,verfiyUser,insertUser,
        otpFunc,verifyOtp,showProducts,showProdDetails,Prodsearch,addReview,searchload,forgotLoad,
        verifyForgot,cartLoad,profileLoad,addAddress,delAdddress,editAdddress,
        addToCart,upCart,cartDel,loadWish,addWish,delWish,checkoutLoad,placeorder,
        orderDone,orderCancel,orderview,saveAddr,upbasic,verifypayment,orderReturn,orderInvoice,payFail}=require('../controller/userController');
//const { render } = require('ejs');

router.use(nocache())
router.use(session({
  secret: 'userSecret',  
  saveUninitialized: true,
  resave: true
}))

router.use(logger('dev'))
router.get('/',loadhome);
// router.get('/home',isLogin,loadhome)
router.get('/register',isLogout,loadRegister);
router.post('/register',insertUser);

//user login(with password)
router.get('/login',isLogout,loadLogin)
router.post('/login',verfiyUser)
router.get('/logout',isLogin,logoutUser)

//user login(with otp)
router.post('/send-otp',otpFunc)
router.post('/verify-otp',verifyOtp)
router.get('/forgot-password',forgotLoad)
router.post('/verify-forgot',verifyForgot)
//all products
router.get('/products',isLogin,showProducts)
router.get('/productdetails',isLogin,showProdDetails)
router.post('/search',isLogin,Prodsearch)
router.get('/search',isLogin,searchload)
router.post('/addreview',isLogin,addReview)
//cart
router.get('/cart',isLogin,cartLoad)
router.post('/addToCart',isLogin,addToCart)
router.put('/change-product-quantity',isLogin,upCart)
router.get('/cart/:id',isLogin,cartDel)
//wishlist
router.get('/wishlist',isLogin,loadWish)
router.get('/addWish',isLogin,addWish)
router.get('/delWish',isLogin,delWish)
//checkout
router.get('/checkout',isLogin,checkCart,checkoutLoad)
router.post('/placeorder',isLogin,checkCart,placeorder)
router.post('/verifypayment',isLogin,verifypayment)
router.get('/ordersuccess',isLogin,orderDone)
router.get('/paymentFailed',isLogin,payFail)
//profile
router.get('/profile',isLogin,profileLoad)
router.post('/add-address',isLogin,addAddress)
router.post('/deladdr',isLogin,delAdddress)
router.get('/edit-address',isLogin,editAdddress)
router.post('/up-address',isLogin,saveAddr)
router.post('/update-basic-info',isLogin,upbasic)
//orders
router.get('/cancel',isLogin,orderCancel)
router.get('/orderview',isLogin,orderview)
router.post('/return',isLogin,orderReturn)
router.get('/download-invoice',isLogin,orderInvoice)
//errors
router.get('/serverError', (req, res) => {
  res.status(500).render('users/Error500');
});
router.get('/userBlocked', (req, res) => {
  res.render('users/Error403');
});

// router.get('*', (req, res) => {
//   res.render('users/Error404');
// });








module.exports=router