const express = require("express");
const ProfilesSchema = require("./schema");
const ExperienceSchema = require("../experience/schema")
const profilesRouter = express.Router();
const experienceModel = require("../experience/schema");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const upload = multer({});
const pdfdocument = require("pdfkit");
const pump = require("pump");
const axios = require("axios");

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
    const profile = await ProfilesSchema.find({ username: username });
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
profilesRouter.get("/:username/pdf", async (req, res, next) => {
  try {
    const profile = await ProfilesSchema.findOne({
      username: req.params.username,
    });
    const getExp = await experienceModel.find({ username: profile.username });
    const doc = new pdfdocument();
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${profile.name}.pdf`
    );

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
    textInRowFirstExperiences(doc, "Role:", 345);
    textInRowFirstExperiences(doc, "Company", 365);
    textInRowFirstExperiences(doc, "Start Date", 385);
    textInRowFirstExperiences(doc, "End Date", 405);
    textInRowFirstExperiences(doc, "Description", 425);
    textInRowFirstExperiences(doc, "Area", 445);

    textInRowSecondExperiences(doc, experience[0].role, 345);
    textInRowSecondExperiences(doc, experience[0].company, 365);
    textInRowSecondExperiences(doc, experience[0].startDate, 385);
    textInRowSecondExperiences(doc, experience[0].endDate, 405);
    textInRowSecondExperiences(doc, experience[0].description, 425);
    textInRowSecondExperiences(doc, experience[0].area, 445);

    doc.pipe(res);

    doc.end();

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
  } catch (error) {
    next(error);
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
