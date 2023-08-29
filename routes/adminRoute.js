const express=require('express')
const router=express.Router()
const session = require('express-session');
const nocache = require('nocache')
const logger = require('morgan')

const upload=require('../middlewares/multer')
const {isLogin,isLogout} = require('../middlewares/adminAuth')
const {loadLogin,verfiyUser,adminLogout,loadhome,loadUser,blockUser,loadCat,addCat,blockCat,loadPro,addproView,addPro,prodel,editprod,upProd,prosearch}=require('../controller/adminController');


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

router.get('/users',isLogin,loadUser)
router.post('/users/:id',isLogin,blockUser)

router.get('/category',isLogin,loadCat)
router.post('/add-category',isLogin,addCat)
router.post('/category/:id',isLogin,blockCat)

router.get('/products',isLogin,loadPro)
router.get('/add-product',isLogin,addproView)
router.post('/add-product',upload.array('images',3),addPro)
router.post('/delete/:id',isLogin,prodel)
router.post('/editproduct',isLogin,editprod)
router.post('/update-product/:id',upload.array('images',3),upProd)
router.post('/search',isLogin,prosearch)
// router.get('/edit',isLogin,editview)



module.exports=router