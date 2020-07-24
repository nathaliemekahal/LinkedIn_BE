const express = require("express");
const ProfilesSchema = require("./schema");
const ExperienceSchema = require("../experience/schema")
const profilesRouter = express.Router();
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const upload = multer({});
const PDFDocument = require("pdfkit");
const { response } = require("express");

// Get all profiles
profilesRouter.get("/", async (req, res, next) => {
  try {
    const profiles = await ProfilesSchema.find(req.query);
    res.status(200).send(profiles);
  } catch (error) {
    next(error);
  }
});

// Get single profile
profilesRouter.get("/:username", async (req, res, next) => {
  try {
    const username = req.params.username;
    const profile = await ProfilesSchema.find({username: username});
    if (profile) {
      res.status(200).send(profile);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("While reading profiles list a problem occurred!");
  }
});

// Post a new image for a profile
profilesRouter.post(
  "/:id/uploadImage",
  upload.single("image"),
  async (req, res) => {
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
      image: fs.readFileSync(
        path.join(
          __dirname +
            "/images/" +
            req.params.id +
            "." +
            req.file.originalname.split(".").pop()
        )
      ),
    };
    //
    await ProfilesSchema.findByIdAndUpdate(req.params.id, obj);
    res.send("image added successfully");
  }
);

// Post a new profile
profilesRouter.post("/", upload.single("image"), async (req, res, next) => {
  try {
    if (req.file) {
      const imagesPath = path.join(__dirname, "/images");
      await fs.writeFile(
        path.join(
          imagesPath,
          req.body.username + "." + req.file.originalname.split(".").pop()
        ),
        req.file.buffer
      );
      var obj = {
        ...req.body,
        image: fs.readFileSync(
          path.join(
            __dirname +
              "/images/" +
              req.body.username +
              "." +
              req.file.originalname.split(".").pop()
          )
        ),
      };
    } else {
      var obj = {
        ...req.body,
        image: fs.readFileSync(path.join(__dirname, "./images/default.jpg")),
      };
    }

    const newProfile = new ProfilesSchema(obj);
    await newProfile.save();
    res.send("ok");
  } catch (error) {
    next(error);
  }
});

// Create a PDF file of a profile
profilesRouter.get("/:id/profilePDF", async (req, res, next) => {
  try {
    // Getting user infos
    const id = req.params.id;
    const profile = await ProfilesSchema.findById(id);
    console.log(profile)
    // Getting user experiences
    const experience = await ExperienceSchema.find({username: profile.username})

    function example() {
      var doc = new PDFDocument();

      var writeStream = fs.createWriteStream(`${profile.name}_${profile.surname}_CV.pdf`);
      doc.pipe(writeStream);
      // Line to the middle
      // doc.moveTo(270, 90).lineTo(270, 190).stroke();
      // doc.moveTo(270, 210).lineTo(270, 330).stroke()

      doc.image(profile.image, 15, 15, {width: 250, height: 270})
      doc.text("PERSONAL INFORMATIONS", 350, 20)
      doc.text("JOB EXPERIENCES", 230, 325 )

      // Rows for the user infos
      row(doc, 40);
      row(doc, 60);
      row(doc, 80);
      row(doc, 100);
      row(doc, 120);

      // Rows for the user experiences
      row(doc, 210) // Role
      row(doc, 230) // Company
      row(doc, 250) // Start Date
      row(doc, 270) // End Date
      row(doc, 290) // Description
      row(doc, 310) // Area

      // Content of user infos
      textInRowFirst(doc, "Name:", 40);
      textInRowFirst(doc, "Surname:", 60);
      textInRowFirst(doc, "Email:", 80);
      textInRowFirst(doc, "Area:", 100);
      textInRowFirst(doc, "Username:", 120);
      textInRowFirst(doc, "Phone Number:", 140);
      textInRowFirst(doc, "Nationality:", 160);


      textInRowSecond(doc, profile.name, 40);
      textInRowSecond(doc, profile.surname, 60);
      textInRowSecond(doc, profile.email, 80);
      textInRowSecond(doc, profile.area, 100);
      textInRowSecond(doc, profile.username, 120);
      textInRowSecond(doc, "3504588976", 140);
      textInRowSecond(doc, "German", 160); 
        // Content of user experiences
        
        const addSpace = 160        
        const exLineHeight = 345       

      for(let i=0; i<experience.length; i++){

        doc.text("Experience number " + (i+1), 15, exLineHeight)

        textInRowFirstExperiences(doc, "Role:", exLineHeight+30);
        textInRowFirstExperiences(doc, "Company", exLineHeight+50);
        textInRowFirstExperiences(doc, "Start Date", exLineHeight+70);
        textInRowFirstExperiences(doc, "End Date", exLineHeight+90);
        textInRowFirstExperiences(doc, "Description", exLineHeight+110);
        textInRowFirstExperiences(doc, "Area", exLineHeight+130);

        textInRowSecondExperiences(doc, experience[i].role, exLineHeight+30);
        textInRowSecondExperiences(doc, experience[i].company, exLineHeight+50);
        textInRowSecondExperiences(doc, experience[i].startDate, exLineHeight+70);
        textInRowSecondExperiences(doc, experience[i].endDate, exLineHeight+90);
        textInRowSecondExperiences(doc, experience[i].description, exLineHeight+110);
        textInRowSecondExperiences(doc, experience[i].area, exLineHeight+130);

        exLineHeight = exLineHeight + ((i+1)*addSpace)   
      }

      
      doc.end();

      writeStream.on("finish", function () {
        // do stuff with the PDF file
        return res.status(200).json({
          ok: "ok",
        });
      });
    }
    // Function for user infos
    function textInRowFirst(doc, text, heigth) {
      doc.y = heigth;
      doc.x = 275;
      doc.fillColor("black");
      doc.text(text, {
        paragraphGap: 5,
        indent: 5,
        align: "justify",
        columns: 1,
      });
      return doc;
    }

    function textInRowSecond(doc, text, heigth) {
      doc.y = heigth;
      doc.x = 375;
      doc.fillColor("black");
      doc.text(text, {
        paragraphGap: 5,
        indent: 5,
        align: "justify",
        columns: 1,
      });
      return doc;
    }

    // Function for user experiences
    function textInRowFirstExperiences(doc, text, heigth) {
      doc.y = heigth;
      doc.x = 15;
      doc.fillColor("black");
      doc.text(text, {
        paragraphGap: 5,
        indent: 5,
        align: "justify",
        columns: 1,
      });
      return doc;
    }

    function textInRowSecondExperiences(doc, text, heigth) {
      doc.y = heigth;
      doc.x = 120;
      doc.fillColor("black");
      doc.text(text, {
        paragraphGap: 5,
        indent: 5,
        align: "justify",
        columns: 1,
      });
      return doc;
    }

     function row(doc, heigth) {
      doc.lineJoin("miter").rect(30, heigth, 500, 20);
      return doc;
    } 

    example();
  } catch (error) {
    console.log(error);
    next("While reading profiles list a problem occurred!");
  }
});

// Modifie a profile
profilesRouter.put("/:id", async (req, res, next) => {
  try {
    const profile = await ProfilesSchema.findOneAndUpdate(
      req.params.id,
      req.body
    );
    if (profile) {
      res.status(200).send("OK");
    } else {
      const error = new Error(`Profile with id ${req.params.id} not found!`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

// Delete a profile
profilesRouter.delete("/:id", async (req, res, next) => {
  try {
    const profile = await ProfilesSchema.findByIdAndDelete(req.params.id);
    if (profile) {
      res.status(200).send("Delete!");
    } else {
      const error = new Error(`Profile with id ${req.params.id} not found!`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = profilesRouter;
