const { body } = require("express-validator"); // check get the value from anywhere but body get the value only from body
const User = require("../models/user");

exports.store = [body("name").notEmpty()];
exports.update = [body("name").notEmpty()];
