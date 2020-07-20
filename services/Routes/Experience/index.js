const express = require("express");
const q2m = require("query-to-mongo");
const ExperienceModel = require("./schema");

const experienceRoute = express.Router();

experienceRoute.post("/", async (req, res) => {
  const newExperience = new ExperienceModel(req.body);
  console.log(newExperience);
  await newExperience.save();

  res.status(201).send("ok");
});

module.exports = experienceRoute;
