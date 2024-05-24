const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const auth = require("./routes/authRoute");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { protect, permition } = require("./controllers/tokenControler");

//to allow the host to acces multi cors
app.use(
  cors({
    origin: ["http://localhost:3000", "www.localhost:3000", "localhost:3000"],
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(express.static("public"));
app.use(express.json());

//for sign up and sign in page
app.use("/api/auth", auth);

//for sign out page
app.use("/api/auth", protect, auth);

//exporting app
module.exports = app;
