
/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Faizal Aslam          Student ID: 152121216        Date: 2022/10/16
*  Online (Cyclic) Link: 
*
********************************************************************************/ 


const express = require("express")
const productService = require('./product-service.js')
const path = require("path")
const app = express()

const HTTP_PORT = process.env.PORT || 8080

app.use('/public', express.static(path.join(__dirname, 'public')));

//added from the doc file


	const multer = require("multer");
	const cloudinary = require('cloudinary').v2
	const streamifier = require('streamifier')




cloudinary.config({
  cloud_name: 'dqautjmwh',
  api_key: '252944672212866',
  api_secret: 'tWTnPNC4fxDtrhxyu4PEBsfNjgo',
  secure: true
});


const upload = multer(); 



function onHttpstart() {
  console.log("Express http server listening on port: " + HTTP_PORT)
}


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/index.html"));
})


app.get("/Products", (req, res)=> {
  productService.getPublishedProducts()
  .then((data)=>{
    res.json({data})
  })

  .catch((err)=>{
    res.json({message: err})
  })
})

app.get("/Demos", (req,res)=>{
  if (req.query.category) {
   productService.getAllProducts()
   .then((data)=>{
     res.json({data})
   })

   .catch((err)=>{
     res.json({message: err})
   })
  }

   else if (req.query.minDateStr) {
    productService.getProductsByMinDate(req.query.minDateStr)
      .then((data) => {
        res.json({ data })
      })

      .catch((err) => {
        res.json({ message: err })
      })
  }

  else {
    productService.getAllProducts()
      .then((data) => {
        res.json({ data })
      })

      .catch((err) => {
        res.json({ message: err })
      })
  }

})

app.get("/Categories", (req,res)=>{
  productService.getCategories()
  .then((data)=>{
    res.json({data})
  })
  .catch((err)=>{
    res.json({message: err})
  })
})

app.get("/products/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addProducts.html"));
})

app.post("/products/add",upload.single("featureImage"), (req, res) => {
  if (req.file) {
    //copied from the docs file given by the prof
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processProduct(uploaded.url);
    });
   } else {
    processProduct("");
   }

   function processProduct(imageUrl) {
    req.body.featureImage = imageUrl;
    console.log(req.body)
    productService.addProduct(req.body).then(() => {
      res.redirect('/products');
    })

  }

})

app.get('/products/:id', (req, res) => {
  productService.getproductById(req.params.id).then((data) => {
    res.json(data)
  })
    .catch((err) => {
      res.json({ message: err });
    })
})

app.use((req, res)=>{
  res.status(404).sendFile(path.join(__dirname, "/views/error.html"))
})

productService.initialize()
.then(()=>{
  app.listen(HTTP_PORT, ()=>{
    console.log(`Express http server listening on ${HTTP_PORT}`)
  })
})

.catch(() => {
  console.log("Failed to fetch details")
})