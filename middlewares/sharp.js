const sharp=require('sharp')
const fs=require('fs')

module.exports={
  crop:(req)=>{
    for(let i=0;i<req.files.length;i++){
      const inputFilePath=req.files[i].path;
    
      sharp(inputFilePath).resize(1000,1000,{
        kernel:sharp.kernel.nearest,
        fit:'fill',
        position:'right top',
      }).toBuffer((err,processedImageBuffer)=>{
        if(err){
          console.log('error for croping',err);
        }else{
          fs.writeFile(inputFilePath,processedImageBuffer,(writeErr)=>{
            if(writeErr){
              console.log('error saving',writeErr);
            }else{
              console.log("Image saved to ",inputFilePath);
            }
          })
        }
      })
    }
  }
}