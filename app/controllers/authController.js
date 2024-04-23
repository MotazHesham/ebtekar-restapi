const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mailHelper = require("../../util/email");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        error.validations = errors.array();
        return next(error);
    }
    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            const error = new Error("A user not found");
            error.statusCode = 401;
            throw error;
        }
        const doMatch = await bcrypt.compare(password, user.password);

        if (doMatch) {
            const token = jwt.sign(
                {
                    email: user.email,
                    userId: user._id.toString()
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION }
            );
            return res.status(200).json({
                message: "logging success",
                data: {
                    token: token,
                    userId: user._id.toString()
                }
            });
        } else {
            const error = new Error("Invalid Email or Password.");
            error.statusCode = 401;
            throw error;
        }
    } catch (err) {
        const error = new Error(err);
        error.statusCode = 500;
        return next(error);
    }
};

exports.putSignup = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone_number = req.body.phone_number;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        error.validations = errors.array();
        return next(error);
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            name: name,
            email: email,
            phone_number: phone_number,
            password: hashedPassword,
            passwordToken: null,
            passwordResetExpires: null,
            cart: { items: [] }
        });
        await user.save();
        mailHelper(
            email,
            "Account Created",
            `Hello ${name}, <br/> your account has been created succesfully`
        );

        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString()
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );
        res.status(201).json({
            message: "User created!",
            data: {
                token: token,
                userId: user._id.toString()
            }
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = 500;
        return next(error);
    }
};

exports.postReset = async (req, res, next) => {
    crypto.randomBytes(32, async (err, buffer) => {
        try {
            if (err) {
                const error = new Error("Error Ocurred!");
                error.statusCode = 500;
                throw error;
            }

            const token = buffer.toString("hex");
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                const error = new Error("No Account with that email found.");
                error.statusCode = 500;
                throw error;
            }

            user.passwordToken = token;
            user.passwordResetExpires = Date.now() + 3600000; //1 hour
            await user.save();

            const mailBody = `
                                <p> You Requested a password reset </p>
                                <p> Click this <a href="http://localhost:3000/resetPassword/${token}">link</a> to set a new password </p>
                            `;
            mailHelper(req.body.email, "Reset Password", mailBody);

            res.status(200).json({ message: "Email Sent Successfully" });
        } catch (err) {
            const error = new Error(err);
            error.statusCode = 500;
            return next(error);
        }
    });
};

exports.getToken = async (req, res, next) => {
    const token = req.params.token;
    try {
        const user = await User.findOne({
            passwordToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });
        if (!user) {
            const error = new Error("The link is invalid or has expired");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: "Valid Token",
            userId: user._id.toString(),
            passwordToken: token
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = 500;
        return next(error);
    }
};

exports.postNewpassword = async (req, res, next) => {
    const userId = req.body.userId;
    const newPassword = req.body.password;
    const passwordToken = req.body.passwordToken;
    try {
        const user = await User.findOne({
            passwordToken: passwordToken,
            passwordResetExpires: { $gt: Date.now() },
            _id: userId
        });
        if (!user) {
            const error = new Error("The link is invalid or has expired");
            error.statusCode = 500;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        user.password = hashedPassword;
        user.passwordToken = null;
        user.passwordResetExpires = null;
        await user.save();
        res.status(200).json({
            message: "Password Changed Successfully"
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = 500;
        return next(error);
    }
};

exports.getProfile = async (req, res, next) => { 
    try {
        const user = req.user;
        
        res.status(200).json({
            message: "User retrieved",
            data: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                userType: user.user_type,
                cart:user.cart
            }
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};
exports.putProfile = async (req, res, next) => {
    
    const user = req.user;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        error.validations = errors.array();
        return next(error);
    }

    
    try {  
        user.email = req.body.email;
        user.name = req.body.name;
        user.phone_number = req.body.phone_number;
        if(req.body.password){
            user.password = await bcrypt.hash(req.body.password, 12);
        }
        await user.save();
        res.status(200).json({
            message: "User retrieved",
            data: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                userType: user.user_type,
                cart:user.cart
            }
        });
    } catch (err) {
        const error = new Error(err);
        error.statusCode = err.statusCode || 500;
        return next(error);
    }
};
