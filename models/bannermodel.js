const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const bannerSchema = new mongoose.Schema({
    title:{
      type:String,
      required:true,
    },
    image:{
      type:String,
      required:true,
    },
    description:{
      type:String,
      required:true,
    },
    isActive:{
      type:Boolean,
      default:false
    }
});

//Export the model
module.exports = mongoose.model('Banner', bannerSchema, "Banner");