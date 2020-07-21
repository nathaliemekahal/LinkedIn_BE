const express = require("express")
const ProfilesSchema = require("./schema")
const profilesRouter = express.Router()
const multer = require("multer")
const fs = require("fs-extra")
const path = require("path")
const upload = multer({});
const PDFDocument = require('pdfkit')


// Get all profiles
profilesRouter.get("/", async (req, res, next) => {
    try {
        const profiles = await ProfilesSchema.find(req.query)
        res.status(200).send(profiles)
    } catch (error) {
        next(error)      
    }
})

// Get single profile
profilesRouter.get("/:id", async (req, res, next) => {
    try {
        const id = req.params.id
        const profile = await ProfilesSchema.findById(id)
        if(profile){
            res.status(200).send(profile)
        }else{
            const error = new Error()
            error.httpStatusCode = 404
            next(error)
        }
    } catch (error) {
        console.log(error)
        next("While reading profiles list a problem occurred!")        
    }    
})

// Post a new image for a profile
profilesRouter.post("/:id", upload.single("image"), async (req, res) => {
    const imagesPath = path.join(__dirname, "/images");
    await fs.writeFile(
      path.join(
        imagesPath,
        req.params.id + "." + req.file.originalname.split(".").pop()
      ),
      req.file.buffer
    );
  
    //
    var obj = {
      image: {
        data: fs.readFileSync(
          path.join(
            __dirname +
              "/images/" +
              req.params.id +
              "." +
              req.file.originalname.split(".").pop()
          )
        ),
        contentType: "image/png",
      },
    };
    //  
    await ProfilesSchema.findByIdAndUpdate(req.params.id, obj);
    res.send("image added successfully");
});

// Post a new profile
profilesRouter.post("/", async (req, res, next) => {
    try {
        const newProfile = {
            ...req.body,
            "image": "https://i.dlpng.com/static/png/5326621-pingu-png-images-png-cliparts-free-download-on-seekpng-pingu-png-300_255_preview.png"
        }
        const rawNewProfile = new ProfilesSchema(newProfile)
        const { id } = await rawNewProfile.save()
        res.status(201).send(id)
    } catch (error) {
        next(error)        
    }    
})

// Create a PDF file of a profile


// Modifie a profile
profilesRouter.put("/:id", async (req, res, next) => {
    try {
        const profile = await ProfilesSchema.findOneAndUpdate(req.params.id, req.body)
        if(profile){
            res.status(200).send("OK")
        }else{
            const error = new Error(`Profile with id ${req.params.id} not found!`)
            error.httpStatusCode = 404
            next(error)
        }
    } catch (error) {
        next(error)        
    }    
})

// Delete a profile
profilesRouter.delete("/:id", async (req, res, next) => {
    try {
        const profile = await ProfilesSchema.findByIdAndDelete(req.params.id)
        if(profile){
            res.status(200).send("Delete!")
        }else{
            const error = new Error(`Profile with id ${req.params.id} not found!`)
            error.httpStatusCode = 404
            next(error)
        }
    } catch (error) {
        next(error)        
    }    
})

module.exports = profilesRouter