const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

let counter = 0;

////signInControler.checkSignIn
router.route("/in").post(async (req, res) => {
  try {
    //geting data from client side
    const { email, password } = req.body;

    //checking if email or password are empty
    if (email == "" || password == "") {
      return res
        .status(400)
        .json({ message: "your email or password must not be empty" });
    }
    //checking if the email is valide
    let user = await User.findOne({
      email: email,
    }).select(
      "+password -name -surname -email  -createdAt -dateOfBirth -phone  -changedPassword -joinedLab"
    );

    if (user) {
      counter++;
      if (counter === 4) {
        counter = 0;
        return res.status(400).json({
          status: "blocked",
          message: "You are blocked for 10 minutes",
        });
      }
    }

    //check if the email is valid or not
    if (!user.isValide) {
      return res.status(400).json({ message: "This acount is not valide" });
    }

    //checking if the password is valide
    if (!user || !(await user.checkPassword(password, user.password))) {
      return res
        .status(401)
        .json({ message: "your email or password are invalide plz check!" });
    }

    //creating a web token for the valid user login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    });

    user.acitve = true;
    await user.save({ validateBeforeSave: false });

    // i dont wont to chow all of this
    user.password = undefined;
    user.isValide = undefined;
    counter = 0;

    //sending cookie to client side
    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
      ),
      httpOnly: false,
      // secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    });

    // sending to data the response if everything is correct
    res.status(200).json({
      status: "success",
      token,
      user,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.route("/out").get(async (req, res) => {
  req.user.acitve = false;
  await req.user.save({ validateBeforeSave: false });
  res.clearCookie("jwt", { maxAge: 0 });
  res.clearCookie("role", { maxAge: 0 });
  res.status(200).json({
    status: "success",
    message: "sign out successfully",
  });
});

router.route("/up").post(async (req, res) => {
  const body = req.body;

  ////////////////////
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SECRET, // replace with your actual email address
      pass: process.env.PASSWORD_SECRET, // replace with your actual email password
    },
  });

  try {
    const user = await User.findOne({ email: body.email });
    let token;
    if (!user) {
      token = jwt.sign({ email: body.email }, process.env.JWT_SECRET);
      body.validationToken = token;
      await User.create(body);
      ///this will change in deployment
      const validationLink = `http://localhost:4000/validate/${token}`;
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_SECRET, // replace with your actual email address
          to: body.email, // replace with the new user's email address
          subject: "Please validate your account",
          text: `Click this link to validate your account: ${validationLink}`,
          html: `<div style="background-color: #f2f2f2; padding: 20px;">
            <h2>Thanks for registering!</h2>
            <p>Please click the button below to validate your account:</p>
            <a href="${validationLink}" style="background-color: #4CAF50; border: none; color: white; padding: 12px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin-top: 20px;">Validate Account</a>
        </div>
        `,
        });
      } catch (e) {
        if (e) await User.deleteOne({ email: body.email });
        return res.status(400).json({ message: e.message });
      }
    }

    res.status(200).json({
      message: "Validation Email succesfully sended plz check your email",
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
