const express = require("express");
const User = require("../Model/User");
const router = express.Router();

router.route("/:token").get(async (req, res) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({ validationToken: token });

    if (!user) {
      // If the token is invalid, send a 404 error
      return res
        .status(400)
        .redirect(
          "http://localhost:3000/sign-in/message='invalide token, plz register again'"
        );
    }

    // Update the user's account to mark it as validated
    user.isValide = true;
    user.validationToken = undefined;
    await user.save();
    res
      .status(200)
      .redirect("http://localhost:3000/sign-in/message='you are valide now'");
  } catch (e) {
    res.status(404).json({ status: "faild", message: e.message });
  }
});

module.exports = router;
