const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

exports.Index = async (req, res, next) => {
    const page = req.query.page || 1;
    try {
        const totalDocuments = await User.countDocuments();
        const totalPages = Math.ceil(
            totalDocuments / +process.env.PAGINATION_PER_PAGE
        );
        const users = await User.find({ deletedAt: null })
            .select("name email phone_number user_type createdAt")
            .sort({ createdAt: -1 })
            .skip((page - 1) * +process.env.PAGINATION_PER_PAGE)
            .limit(+process.env.PAGINATION_PER_PAGE);
        res.status(200).json({
            data: users,
            pagination: {
                links: {
                    first: `${req.protocol}://${req.get(
                        "host"
                    )}/admin/users?page=1`,
                    last: `${req.protocol}://${req.get(
                        "host"
                    )}/admin/users?page=${totalPages > 1 ? totalPages : 1}`,
                    prev:
                        page > 1
                            ? `${req.protocol}://${req.get(
                                    "host"
                                )}/admin/users?page=${page - 1}`
                            : null,
                    next:
                        page < totalPages
                            ? `${req.protocol}://${req.get(
                                    "host"
                                )}/admin/users?page=${page + 1}`
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
        const userId = req.params.userId;
        const user = await User.findOne({ _id: userId, deletedAt: null }); 
        if(!user){
            const error = new Error('User Not Found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: "User retrieved",
            data: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                userType: user.user_type,
                createdAt: user.createdAt
            },
        });
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
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            password: hashedPassword,
            user_type: req.body.user_type,
            cart: { items: [] }
        });
        await user.save();
        res.status(201).json({
            message: "User Created Successfully!",
            data: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                userType: user.user_type,
                createdAt: user.createdAt
            }
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
        const userId = req.params.userId;
        const user = await User.findById(userId);
        user.name = req.body.name;
        user.email = req.body.email;
        user.user_type = req.body.user_type;
        user.phone_number = req.body.phone_number;
        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(password, 12);
            user.password = hashedPassword;
        }
        await user.save();
        res.status(200).json({
            message: "User Updated Successfully",
            data: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                userType: user.user_type,
                createdAt: user.createdAt
            }
        });
    } catch (err) { 
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};
exports.Destroy = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await User.findOne({_id:userId,deletedAt:null});
        if(!user){
            const error = new Error('User Not Found');
            error.statusCode = 404;
            throw error;
        }
        user.deletedAt = Date.now();
        await user.save();
        res.status(200).json({
            message: "User Deleted Successfully"
        });
    } catch (err) { 
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};
