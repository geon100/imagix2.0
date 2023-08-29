const mongoose=require('mongoose')
const dbName='imagix'
const dbUrl = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.1';

const dbConnect = {
  connect:()=>{
    mongoose.connect(dbUrl,{dbName}, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));
  }
}
 
module.exports=dbConnect