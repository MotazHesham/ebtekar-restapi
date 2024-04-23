const { body } = require("express-validator"); // check get the value from anywhere but body get the value only from body
const User = require("../models/user");

exports.store = [
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
            min: 5
        }),
    body("name").notEmpty(),
    body("user_type", "only (admin-client) values allwed for user_type").isIn([
        "client",
        "admin"
    ])
];
exports.update = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .custom((value, { req }) => {
            return User.findOne({ email: value, _id:{$ne:req.params.userId} }).then((userDoc) => {
                if (userDoc) {
                    return Promise.reject("User already exists");
                }
            });
        })
        .normalizeEmail(),
    body("password")
        .trim(),
    body("name").notEmpty(),
    body("user_type", "only (admin-client) values allwed for user_type").isIn([
        "client",
        "admin"
    ]),
    body("phone_number").notEmpty() 
];
