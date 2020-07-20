const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    username: String,
    image: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

const postModel = model("post", postSchema);
module.exports = postModel;
