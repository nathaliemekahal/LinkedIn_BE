const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const ExperienceSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
    },
    description: {
      type: String,
    },
    area: {
      type: String,
    },
    username: {
      type: String,
    },
    image: {
      type: Buffer,
    },
  },
  { timestamps: true }
);

const ExperienceModel = model("experience", ExperienceSchema);

module.exports = ExperienceModel;
