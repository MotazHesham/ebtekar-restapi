const express = require("express"); 
const mongoose = require("mongoose");   
const middlewareInit = require('./app/middlewares/init'); 

const app = express();
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@atlascluster.phy2cln.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;  

middlewareInit(app);

// DATABASE CONNECTION
mongoose
    .connect(MONGODB_URI)
    .then((results) => {
        app.listen(8080);
        console.log("Connected!");
    })
    .catch((err) => console.log(err));
