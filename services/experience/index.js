const express = require("express");
const q2m = require("query-to-mongo");
const ExperienceModel = require("./schema");
const e = require("express");
const multer = require("multer");
const upload = multer({});
const fs = require("fs-extra");
const path = require("path");
const v = require("validator");
const json2csv = require("json2csv");
const { Transform } = require("json2csv");

const pump = require("pump");
const experienceRoute = express.Router();

// experienceRoute.post("/", async (req, res) => {
//   const newExperience = new ExperienceModel(req.body);
//   console.log(newExperience);
//   await newExperience.save();

//   res.status(201).send("ok");
// });
// experienceRoute.get("/export/csv2/:id", async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     const experience = await ExperienceModel.find({ _id: req.params.id });

//     const jsonReadableStream = fs.createReadStream(experience.toString());

//     const json2csv = new Transform({
//       fields: [
//         "_id",
//         "role",
//         "company",
//         "startDate",
//         "endDate",
//         "description",
//         "area",
//         "username",
//         "createdAt",
//         "updatedAt",
//       ],
//     });

//     res.setHeader("Content-Disposition", "attachment; filename=export.csv");
//     pump(jsonReadableStream, json2csv, res, (err) => {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log("Done");
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });
// experienceRoute.get("/export/csv/:id", async (req, res, next) => {
//   // try {

//   console.log("here");
//   const id = req.params.id;
//   const experience = await ExperienceModel.find({ _id: req.params.id });

//   const fields = [
//     "_id",
//     "role",
//     "company",
//     "startDate",
//     "endDate",
//     "description",
//     "area",
//     "username",
//     "createdAt",
//     "updatedAt",
//   ];
//   const csvString = json2csv(experience);
//   res.setHeader(
//     "Content-disposition",
//     "attachment; filename=shifts-report.csv"
//   );
//   res.set("Content-Type", "text/csv");
//   res.status(200).send(csvString);
// });

experienceRoute.get("/:userName/experience", async (req, res) => {
  try {
    const experience = await ExperienceModel.find({
      username: req.params.userName,
    });

    res.send(experience);
  } catch (error) {
    console.log(error);
  }
});

// experienceRoute.put("/:id", async (req, res) => {
//   const id = req.params.id;
//   const experience = await ExperienceModel.findByIdAndUpdate(
//     id,
//     {
//       ...req.body,
//     },
//     { runValidators: true }
//   );
//   if (experience) {
//     res.send("UPDATED");
//   }
// });

// experienceRoute.delete("/:id", async (req, res) => {
//   try {
//     await ExperienceModel.findByIdAndDelete(req.params.id);
//     res.send("deleted");
//   } catch (error) {
//     console.log(error);
//   }
// });
// experienceRoute.post("/:id", upload.single("image"), async (req, res) => {
//   const imagesPath = path.join(__dirname, "/images");
//   await fs.writeFile(
//     path.join(
//       imagesPath,
//       req.params.id + "." + req.file.originalname.split(".").pop()
//     ),
//     req.file.buffer
//   );

//   //
//   var obj = {
//     image: {
//       data: fs.readFileSync(
//         path.join(
//           __dirname +
//             "/images/" +
//             req.params.id +
//             "." +
//             req.file.originalname.split(".").pop()
//         )
//       ),
//       contentType: "image/png",
//     },
//   };
//   //

//   await ExperienceModel.findByIdAndUpdate(req.params.id, obj);
//   res.send("image added successfully");
// });

experienceRoute.post("");
module.exports = experienceRoute;
