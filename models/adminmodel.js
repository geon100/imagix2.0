const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
       },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    mobile:{
      type:String,
      required:true,
      unique:true,
    }
});

//Export the model
module.exports = mongoose.model('Admin', userSchema);