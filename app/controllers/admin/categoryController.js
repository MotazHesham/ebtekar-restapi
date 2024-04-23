const Category = require("../../models/category");
const { validationResult } = require("express-validator");

exports.Index = async (req, res, next) => {
    const page = req.query.page || 1;
    try {
        const totalDocuments = await Category.countDocuments();
        const totalPages = Math.ceil(
            totalDocuments / +process.env.PAGINATION_PER_PAGE
        );
        const categories = await Category.find({deletedAt:null})
            .sort({ createdAt: -1 })
            .skip((page - 1) * +process.env.PAGINATION_PER_PAGE)
            .limit(+process.env.PAGINATION_PER_PAGE);
        res.status(200).json({
            data: categories,
            pagination: {
                links: {
                    first: `${req.protocol}://${req.get(
                        "host"
                    )}/admin/categories?page=1`,
                    last: `${req.protocol}://${req.get(
                        "host"
                    )}/admin/categories?page=${
                        totalPages > 1 ? totalPages : 1
                    }`,
                    prev:
                        page > 1
                            ? `${req.protocol}://${req.get(
                                "host"
                                )}/admin/categories?page=${page - 1}`
                            : null,
                    next:
                        page < totalPages
                            ? `${req.protocol}://${req.get(
                                "host"
                                )}/admin/categories?page=${page + 1}`
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
        const categoryId = req.params.categoryId;
        const category = await  Category.find({_id:categoryId,deletedAt:null});

        res.status(200).json({ data: category, message: 'Category retrieved'});
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

    try {
        const category = new Category({
            name: req.body.name
        });
        await category.save();
        res.status(201).json({
            message: "Category Created Successfully!",
            data: category
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

        const categoryId = req.params.categoryId;
        const category = await  Category.findById(categoryId);
        category.name = req.body.name;
        await category.save();
        res.status(200).json({
            message: 'Category Updated Successfully',
            data: category
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};
exports.Destroy = async (req, res, next) => {
    try { 
        const categoryId = req.params.categoryId;
        const category = await  Category.findById(categoryId);
        category.deletedAt = Date.now();
        await category.save();
        res.status(200).json({
            message: 'Category Deleted Successfully'
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};
