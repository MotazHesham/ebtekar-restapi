const express = require("express");

const authController = require("../app/controllers/authController");
const authValidator = require("../app/validations/authValidation");
const isAuth = require("../app/middlewares/is-auth");

const router = express.Router();

router.post("/login", authValidator.SigninValidation, authController.postLogin);

router.put("/signup", authValidator.SignupValidation, authController.putSignup);
router.post(
    "/resetPassword",
    authValidator.ResetPassword,
    authController.postReset
);
router.get("/resetPassword/:token", authController.getToken);
router.post(
    "/newPassword",
    authValidator.NewPasswordValidation,
    authController.postNewpassword
);

// Profile
router.get("/profile", isAuth, authController.getProfile);
router.put("/profile", isAuth,authValidator.putProfile, authController.putProfile);

module.exports = router;
