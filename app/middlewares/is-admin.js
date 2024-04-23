const jwt = require('jsonwebtoken');
const User = require('../models/user');
module.exports = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader){
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        next(error);
    }
    const token = authHeader.split(' ')[1]
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if(!decodedToken){
            const error = new Error('Not authneticated');
            error.statusCode = 401;
            throw error; 
        }
        const user = await User.findOne({_id:decodedToken.userId,deletedAt:null});
        if(!user){
            const error = new Error("User doesn't exist");
            error.statusCode=401;
            throw error;
        }
        if(user.user_type != "admin"){
            const error = new Error("User Not Authorized");
            error.statusCode=403;
            throw error;
        }
        req.userId= decodedToken.userId;
        req.user= user;
        next();
    }catch(err){ 
        const error = new Error(err.message);
        error.statusCode = err.statusCode || 500;
        next(error);
    }
    
};
