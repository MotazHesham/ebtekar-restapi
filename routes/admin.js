const express = require("express");
const isAdmin = require('../app/middlewares/is-admin');
const categoryController = require("../app/controllers/admin/categoryController"); 
const categoryValidator = require('../app/validations/categoryValidation');
const productController = require("../app/controllers/admin/productController"); 
const productValidator = require('../app/validations/productValidation');
const userController = require("../app/controllers/admin/userController"); 
const userValidator = require('../app/validations/userValidation');
const orderController = require("../app/controllers/admin/orderController"); 

const router = express.Router();

// Categories
router.get("/categories", isAdmin, categoryController.Index);
router.get("/categories/:categoryId", isAdmin, categoryController.Show);
router.put("/categories/:categoryId", isAdmin, categoryValidator.update, categoryController.Update);
router.delete("/categories/:categoryId", isAdmin, categoryController.Destroy);
router.post("/categories", isAdmin, categoryValidator.store, categoryController.Store); 

// Products
router.get("/products", isAdmin, productController.Index);
router.get("/products/:productId", isAdmin, productController.Show);
router.put("/products/:productId", isAdmin, productValidator.update, productController.Update);
router.delete("/products/:productId", isAdmin, productController.Destroy);
router.post("/products", isAdmin, productValidator.store, productController.Store); 

// Users
router.get("/users", isAdmin, userController.Index);
router.get("/users/:userId", isAdmin, userController.Show);
router.put("/users/:userId", isAdmin, userValidator.update, userController.Update);
router.delete("/users/:userId", isAdmin, userController.Destroy);
router.post("/users", isAdmin, userValidator.store, userController.Store); 

// Orders
router.get("/orders", isAdmin, orderController.Index);

module.exports = router;
