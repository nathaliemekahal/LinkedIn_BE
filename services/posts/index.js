const express = require("express");
const postModel = require("./schema");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");

const router = express.Router();
const upload = multer({});

// GET all posts
router.get("/", async (req, res) => {
  const posts = await postModel.find();
  res.send(posts);
});

// GET a specific post

router.get("/:id", async (req, res) => {
  const post = await postModel.findById(req.params.id);
  res.send(post);
});

//POST a post
router.post("/", async (req, res) => {
  const post = await new postModel(req.body);
  post.save();
  res.send("Posted Successfully");
});

//POST a image
router.post("/:id", upload.single("image"), async (req, res) => {
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

  await postModel.findByIdAndUpdate(req.params.id, obj);
  res.send("image added successfully");
});

//PUT
router.put("/:id", async (req, res) => {
  await postModel.findByIdAndUpdate(req.params.id, req.body);
  res.send("updated sucessfully");
});

//DELETE

router.delete("/:id", async (req, res) => {
  await postModel.findByIdAndDelete(req.params.id);
  res.send("Deleted sucessfully");
});

module.exports = router;
