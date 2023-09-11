const Admin=require('../models/adminmodel')
const User=require('../models/usermodel')

const bcrypt = require('bcrypt');

let crederror=false// flags

//admin login
const loadLogin = async(req,res)=>{
   try {  
      if(crederror===true){
         crederror=false
         res.render('admin/login',{message:"Invalid email or password"});
       }
       else
       res.render('admin/login',{message:''});
     }
 catch (error) {
     console.log(error.message);
  }
}
//admin home
const loadhome = async(req,res)=>{
   try {
     res.render('admin/home')
   } catch (error) {
      console.log(error.message)
   }
}

//verify login
const verfiyUser = async(req,res)=>{
   try {
      const email = req.body.mail;
      const password = req.body.password;
      console.log(req.body)
      const userData = await Admin.findOne({email:email});
      if(userData){
         if(await bcrypt.compare(password,userData.password)){
            req.session.admin = userData
            res.redirect('/admin/home')
         }else{
            crederror=true
            res.redirect('/admin');
         }
      }else{
         crederror=true
         res.redirect('/admin');
      }

   } catch (error) {
      console.log(error.message)
   }
}

const adminLogout= async(req,res)=>{
   req.session.admin=undefined
   res.redirect('/admin')
}

//user management
const loadUser= async(req,res)=>{
   try {
      const users=await User.find({},{password:0}).lean()
      //console.log(users)
      res.render('admin/user',{users:users})
      

    } catch (error) {
       console.log(error.message)
    }
}


const blockUser=async(req,res)=>{
   const user=await User.findById(req.params.id)
   user.isActive = !user.isActive;
   await user.save();
   res.redirect('/admin/users')
}



module.exports={loadLogin,verfiyUser,adminLogout,loadhome,loadUser,blockUser}