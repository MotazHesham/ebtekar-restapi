const { body } = require("express-validator"); // check get the value from anywhere but body get the value only from body
const Category = require("../models/category");

exports.store = [
    body("name").notEmpty(),
    body("price").notEmpty(),
    body("categoryId").notEmpty()
];
exports.update = [
    body("name").notEmpty(),
    body("price").notEmpty(),
    body("categoryId").notEmpty()
];
