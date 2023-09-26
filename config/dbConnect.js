const mongoose=require('mongoose')
const dotenv=require('dotenv').config()
const dbName=process.env.dbName
const dbUrl = process.env.dbUrl

console.log(typeof dbName,typeof dbUrl)

const dbConnect = {
  connect:()=>{
    mongoose.connect(dbUrl,{dbName}, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));
  }
}
 
module.exports=dbConnect 