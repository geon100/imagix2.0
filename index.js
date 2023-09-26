const express=require('express')
const mongo = require('./config/dbConnect')
const app=express()
const dotenv=require('dotenv').config()
const path=require('path')
const PORT=process.env.PORT||4000
mongo.connect()

app.set('view engine', 'ejs'); 
app.set('views', __dirname + '/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

function isActive(url, req) {
  return req.path === url;
}

// Make the isActive function available in res.locals
app.use(function(req, res, next) {
  res.locals.isActive = function(url) {
    return isActive(url, req);
  };
  next();
});

app.use('/',require('./routes/userRoute'))
app.use('/admin',require('./routes/adminRoute'))

app.get('*', (req, res) => {
  res.render('users/Error404');
});
 app.listen(PORT,()=>{
  console.log(`Server is running at PORT: ${PORT}`);
 })
 