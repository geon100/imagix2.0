const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
       },
    lastname:{
      type:String,
      required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    isActive:{
        type:Boolean,
        default:true
    },
    password:{
        type:String,
        required:true,
    },
    address:{
        type:Array
    },
    cart: [
        {
          id: String, // or ObjectId, depending on your use case
          quantity: Number
        }
      ],
    wishlist: {
        type:Array
    }
    
});

//Export the model
module.exports = mongoose.model('User', userSchema);