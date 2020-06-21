var multer = require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './images');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
});

// File Filter
// Image Resizing
   
var upload = multer({ storage });
module.exports = upload;