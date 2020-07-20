const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const server = express();

dotenv.config();

const port = process.env.PORT;
server.use(express.json());

server.use(cors());

mongoose
  .connect("mongodb://localhost:27017/LinkedIn", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(
    server.listen(port, () => {
      console.log("Running on port", port);
    })
  )
  .catch((err) => console.log(err));