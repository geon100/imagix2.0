const express=require('express')
const router=express.Router()
const session = require('express-session');
const nocache = require('nocache')
const logger = require('morgan')

const {isLogin,isLogout} = require('../middlewares/userAuth')
const {loadhome,loadLogin,logoutUser,loadRegister,verfiyUser,insertUser,otpFunc,verifyOtp,showProducts,showProdDetails}=require('../controller/userController');
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

//all products
router.get('/products',isLogin,showProducts)
router.get('/productdetails',isLogin,showProdDetails)








module.exports=router