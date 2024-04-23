const multer = require("multer");


exports.fileStroage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'storage'); 
    },
    filename:(req,file,cb)=>{ 
        cb(null, Date.now() + '-' +file.originalname);
    }
});

exports.fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}