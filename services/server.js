const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const postsRoutes = require("./posts");

const server = express();
const listEndpoints = require("express-list-endpoints");
const profilesRouter = require("./profiles/index") 
const {
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./errorHandlers")

dotenv.config();

const port = process.env.PORT;
server.use(express.json());

server.use(cors());
server.use("/posts", postsRoutes);

server.use("/profiles", profilesRouter)

server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

console.log(listEndpoints(server));

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
