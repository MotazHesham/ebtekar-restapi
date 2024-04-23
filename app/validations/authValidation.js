const { body } = require("express-validator"); // check get the value from anywhere but body get the value only from body
const User = require("../models/user");

exports.SigninValidation = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email") 
        .normalizeEmail(),
    body(
        "password",
        "Password must be at least 5 characters long, and only number and text."
    )
        .trim()
        .isLength({ min: 5 }),
];

exports.SignupValidation = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email") 
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then((userDoc) => {
                if (userDoc) {
                    return Promise.reject("User already exists");
                }
            });
        })
        .normalizeEmail(),
    body("password", "Password must be at least 5 characters long")
        .trim()
        .isLength({
            min: 5,
        }),
    body("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            if (value == req.body.password) {
                return true;
            } else {
                throw new Error("Passwords do not match");
            }
        }),
];

exports.ResetPassword = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")  
        .normalizeEmail(), 
];

exports.NewPasswordValidation = [
    body("userId")  
        .custom((value, { req }) => {
            return User.findById(value).then((userDoc) => {
                if (!userDoc) {
                    return Promise.reject("User Not Found");
                }
            });
        }), 
    body("password", "Password must be at least 5 characters long")
        .trim()
        .isLength({
            min: 5,
        }),
    body("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            if (value == req.body.password) {
                return true;
            } else {
                throw new Error("Passwords do not match");
            }
        }),
];

exports.putProfile = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .custom((value, { req }) => {
            return User.findOne({ email: value, _id:{$ne:req.userId} }).then((userDoc) => {
                if (userDoc) {
                    return Promise.reject("User already exists");
                }
            });
        })
        .normalizeEmail(),
    body("password")
        .trim(),
    body("name").notEmpty(),
    body("phone_number").notEmpty() 
]
