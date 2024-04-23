const express = require("express"); 
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const authRoutes = require('../../routes/auth');
const adminRoutes = require('../../routes/admin');
const shopRoutes = require('../../routes/shop');
const {fileStroage,fileFilter} = require('../../util/fileSystem');

module.exports = (app) => {

    app.use(helmet());
    app.use(compression());
    app.use(bodyParser.json()); // application/json 
    app.use("/storage", express.static(path.join(__dirname, "storage"))); 
    app.use(multer({storage:fileStroage,fileFilter:fileFilter}).single('image'));
    
    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "OPTIONS,GET,POST,PUT,PATCH,DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
        next();
    });
    

    // define Apis
    app.use("/auth", authRoutes);
    app.use("/admin", adminRoutes);
    app.use("/shop", shopRoutes);
    
    app.use((error, req, res, next) => {
        console.log(error);
        const status = error.statusCode;
        const message = error.message;
        res.status(status || 500).json({
            message: message,
            validations:error.validations || [],
        });
    });
}