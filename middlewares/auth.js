var jwt = require('jsonwebtoken');
var responses = require('../config/response');
var db = require('../config/db');

exports.tokenAuth = (req, res, next) => {
	const token = res.headers['token'];
	if(!token) {
		responses.unauth(res, {message: "Missing Headers"});
		return
	}
	let obj;
	try {
		obj = jwt.verify(token, process.env.auth_pass);
	} catch(e) {
		responses.unauth(res, {message: "Invalid Session"});
		return
	}
	
	if(obj) {
		db.query("SELECT * FROM users WHERE token = $1", [token])
		.then( (result) => {
			if(result.rowCount) {
				next();
			} else {
				responses.forbidden(res, {message: "Invalid Headers"});
			}
		}).catch( () => {
			responses.forbidden(res, {message: "Unexpected Error has Occurred"});
		});
	} else {
		responses.forbidden(res, {message: "Unexpected Error has Occurred"});
	}
};