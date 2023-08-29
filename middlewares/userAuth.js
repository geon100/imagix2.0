const User=require('../models/usermodel')

const isLogin = async(req,res,next)=>{
  try {
     if(req.session.user){
      const user=await User.findById(req.session.user._id)
      if(user.isActive)
         next()
      else{
         req.session.user=undefined
         res.redirect('/login');
      }

     }
     else{
         res.redirect('/login');
     }
  } catch (error) {
     console.log(error.message)
  }
}

const isLogout = async(req,res,next)=>{
  try {
     if(req.session.user){
        res.redirect('/');
     }else{
        next();
     }
     
  } catch (error) {
     console.log(error.message)
  }
}

module.exports = {
  isLogin,
  isLogout
}