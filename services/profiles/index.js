const express = require("express");
const ProfilesSchema = require("./schema");
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
    /*
        const newProfile = {
            ...req.body,
            "image": "https://i.dlpng.com/static/png/5326621-pingu-png-images-png-cliparts-free-download-on-seekpng-pingu-png-300_255_preview.png"
        }
        const rawNewProfile = new ProfilesSchema(newProfile)
        const { id } = await rawNewProfile.save()
        res.status(201).send(id)

        */
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
    const url =
      "https://images.unsplash.com/photo-1533907650686-70576141c030?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80";
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${profile.name}.pdf`
    );

    doc.font("Helvetica-Bold");
    doc.fontSize(18);

    doc.text(`${profile.name} ${profile.surname}`, 100, 140, {
      width: 410,
      align: "center",
    });
    doc.fontSize(12);
    doc.font("Helvetica");
    doc.text(
      `

    ${profile.area}
    ${profile.email}`,
      360,
      180,
      {
        align: "left",
      }
    );
    doc.fontSize(18);
    doc.text("Experiences", 100, 270, {
      width: 410,
      align: "center",
    });
    doc.fontSize(12);
    const start = async () => {
      getExp.forEach(
        async (exp) =>
          doc.text(`
          Role: ${exp.role}
          Company: ${exp.company}
          Starting Date: ${exp.startDate.toString().slice(4, 15)}
          Description: ${exp.description}
          Area:  ${exp.area}
          -------------------------------------------------------
        `),
        {
          width: 410,
          align: "center",
        }
      );
    };
    await start();

    let grad = doc.linearGradient(50, 0, 350, 100);
    grad.stop(0, "#0077B5").stop(1, "#004451");

    doc.rect(0, 0, 70, 1000);
    doc.fill(grad);

    doc.pipe(res);

    doc.end();
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
