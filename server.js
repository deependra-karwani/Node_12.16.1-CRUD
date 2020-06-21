require('dotenv').config();
var express = require('express');
var exp = express();
var bodyParser = require('body-parser');

var userRouter = require('./routes/userRoutes');

/** Middlewares */
exp.use(bodyParser.json());
/** ~Middlewares */

/** CORS */
exp.use( (req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Origin, X-Requested-With, Accept");
	res.setHeader("Access-Control-Expose-Headers", "");
	next();
});
/** ~CORS */

/** File Serve */
exp.use('/static', express.static(__dirname+'/images'));
/** ~File Serve */

/** API Serve */
exp.use('/user', userRouter);
/** API Serve */

exp.listen(process.env.PORT, () => {
	console.log(`Server listening on ${process.env.PORT}`);
});