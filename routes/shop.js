const express = require("express");
const isAuth = require("../app/middlewares/is-auth");
const shopController = require("../app/controllers/shop/shopController");
const orderController = require("../app/controllers/shop/orderController");

const router = express.Router();

// Shop
router.get("/categories", shopController.categories);
router.get("/products", shopController.products);
router.get("/products/:categoryId", shopController.productsByCategory);

// Cart
router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.addToCart);
router.delete("/cart/:productId", isAuth, shopController.removeFromCart);
router.post("/checkout", isAuth, shopController.checkout);

// Order
router.get("/orders", isAuth, orderController.getIndex);

module.exports = router;
