const Category = require("../../models/category");
const Product = require("../../models/product");
const Order = require("../../models/order");

const { validationResult } = require("express-validator");

exports.categories = async (req, res, next) => {
    try {
        const categories = await Category.find({ deletedAt: null })
            .select(["name"])
            .sort({ createdAt: -1 });
        res.status(200).json({
            data: categories,
            message: "Categories retrieved successfully"
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};

exports.products = async (req, res, next) => {
    const page = req.query.page || 1;
    try {
        const totalDocuments = await Product.countDocuments();
        const totalPages = Math.ceil(
            totalDocuments / +process.env.PAGINATION_PER_PAGE
        );
        const products = await Product.find({
            deletedAt: null,
            published: true
        })
            .select("name description imageUrl price quantity ")
            .populate("category", ["name"])
            .sort({ createdAt: -1 })
            .skip((page - 1) * +process.env.PAGINATION_PER_PAGE)
            .limit(+process.env.PAGINATION_PER_PAGE);
        res.status(200).json({
            data: products,
            pagination: {
                links: {
                    first: `${req.protocol}://${req.get(
                        "host"
                    )}/shop/products?page=1`,
                    last: `${req.protocol}://${req.get(
                        "host"
                    )}/shop/products?page=${totalPages > 1 ? totalPages : 1}`,
                    prev:
                        page > 1
                            ? `${req.protocol}://${req.get(
                                  "host"
                              )}/shop/products?page=${page - 1}`
                            : null,
                    next:
                        page < totalPages
                            ? `${req.protocol}://${req.get(
                                  "host"
                              )}/shop/products?page=${page + 1}`
                            : null
                },
                meta: {
                    currentPage: page,
                    last_page: totalPages > 1 ? totalPages : 1,
                    items_per_page: +process.env.PAGINATION_PER_PAGE,
                    total_items: totalDocuments,
                    total_pages: totalPages > 1 ? totalPages : 1
                }
            }
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};

exports.productsByCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.categoryId;
        const products = await Product.find({
            category: categoryId,
            deletedAt: null
        })
            .sort({ createdAt: -1 })
            .select("name description imageUrl price quantity ");

        if (!products) {
            const error = new Error("Not Found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ data: products, message: "Product retrieved" });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};

exports.getCart = async (req, res, next) => {
    try {
        const user = await req.user.populate(
            "cart.items.productId",
            "name imageUrl price"
        );
        res.status(200).json({
            data: user.cart.items,
            message: "Success"
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};

exports.addToCart = async (req, res, next) => {
    const productId = req.body.product_id;

    try {
        const product = await Product.findOne({
            _id: productId,
            deletedAt: null
        });
        if (!product) {
            const error = new Error("The product is not Found");
            error.statusCode = 401;
            throw error;
        }
        await req.user.addToCart(product);
        res.redirect("/shop/cart");
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};

exports.removeFromCart = async (req, res, next) => {
    const user = req.user;
    const productId = req.params.productId;
    try {
        await user.removeFromCart(productId);
        res.redirect("/shop/cart");
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};

exports.checkout = async (req, res, next) => {
    try {
        const user = await req.user.populate("cart.items.productId");
        let totalCost = 0;
        const products = user.cart.items.map((i) => {
            let product = i.productId._doc;
            totalCost += product.price * i.quantity;
            return {
                quantity: i.quantity,
                product: {
                    name: product.name,
                    price: product.price,
                    productId: product._id,
                    imageUrl: product.imageUrl
                }
            };
        });
        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user,
                address: req.body.address,
                phone_number: req.body.phone_number
            },
            products: products,
            totalCost: totalCost
        });
        await order.save();
        await req.user.clearCart();
        res.redirect("/shop/orders");
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};
