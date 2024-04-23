const Product = require("../../models/product");
const Category = require("../../models/category");
const { validationResult } = require("express-validator");
const fileHelper = require('../../../util/file');

exports.Index = async (req, res, next) => {
    const page = req.query.page || 1;
    try {
        const totalDocuments = await Product.countDocuments();
        const totalPages = Math.ceil(
            totalDocuments / +process.env.PAGINATION_PER_PAGE
        );
        const products = await Product.find({ deletedAt: null })
            .populate("category")
            .sort({ createdAt: -1 })
            .skip((page - 1) * +process.env.PAGINATION_PER_PAGE)
            .limit(+process.env.PAGINATION_PER_PAGE);
        res.status(200).json({
            data: products,
            pagination: {
                links: {
                    first: `${req.protocol}://${req.get(
                        "host"
                    )}/admin/products?page=1`,
                    last: `${req.protocol}://${req.get(
                        "host"
                    )}/admin/products?page=${totalPages > 1 ? totalPages : 1}`,
                    prev:
                        page > 1
                            ? `${req.protocol}://${req.get(
                                    "host"
                                )}/admin/products?page=${page - 1}`
                            : null,
                    next:
                        page < totalPages
                            ? `${req.protocol}://${req.get(
                                    "host"
                                )}/admin/products?page=${page + 1}`
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
exports.Show = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findOne({ _id: productId, deletedAt: null });

        if(!product){
            const error = new Error("Not Found");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ data: product, message: "Product retrieved" });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};
exports.Store = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        error.validations = errors.array();
        next(error);
    }

    if (!req.file) {
        const error = new Error("Missing image");
        error.statusCode = 422;
        next(error);
    }

    try {
        const category = await Category.findOne({
            _id: req.body.categoryId,
            deletedAt: null
        });
        if (!category) {
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
        }

        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: category,
            imageUrl: req.file.path
        });
        await product.save();
        res.status(201).json({
            message: "Product Created Successfully!",
            data: product
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};
exports.Update = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        error.validations = errors.array();
        next(error);
    }

    try {

        const category = await Category.findOne({
            _id: req.body.categoryId,
            deletedAt: null
        });
        if (!category) {
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
        }

        const productId = req.params.productId;
        const product = await Product.findById(productId);
        product.name = req.body.name;
        product.description = req.body.description;
        product.price = req.body.price;
        product.category = category;
        if (req.file) {
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = req.file.path;
        }
        await product.save();
        res.status(200).json({
            message: "Product Updated Successfully",
            data: product
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};
exports.Destroy = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        product.deletedAt = Date.now();
        await product.save();
        res.status(200).json({
            message: "Product Deleted Successfully"
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};
