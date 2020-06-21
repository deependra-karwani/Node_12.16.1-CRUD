var jwt = require('jsonwebtoken');
var responses = require('../config/response');
var db = require('../config/db');
var bcrypt = require('bcryptjs');
const { auth_pass } = process.env;

exports.register = (req, res) => {
	// E-mail Verification for Authentication
	let image = '';
	if(req.file && req.file.originalname) {
		image = req.file.originalname;
	}

	let { name, email, mobile, username, password, fcm } = req.body;

	bcrypt.genSalt(10, (err, salt) => {
		if(err) {return responses.forbidden(res, {message: "Could not Secure Details. Please Try Again."});}
		
		bcrypt.hash(password, salt, (err, hash) => {
			if(err) {return responses.forbidden(res, {message: "Could not Secure Details. Please Try Again."});}

			let token = jwt.sign({email}, auth_pass, {expiresIn: '1h'});
			db.query("INSERT INTO users(name, email, mobile, username, password, fcm, token, profPic) VALUES($1, $2, $3, $4, $5, $6, $7, $8)", [name, email, mobile, username, hash, fcm, token, image])
			.then( (result) => {
				if(result.rowCount) {
					responses.successWHeaders(res, {token}, {message: "Registration Successful", userid: result.rows[0].id});
				} else {
					responses.badReq(res, {message: "Could not Complete Registration"});
				}
			}).catch( (err) => {
				responses.badReq(res, {message: "Could not Complete Registration"});
			});
		});
	});
};

exports.login = (req, res) => {
	let { username, password } = req.body;

	// db.query("SELECT email, password FROM users WHERE username = $1 AND token = NULL", [username]) // Single Session Only
	db.query("SELECT id, email, password FROM users WHERE username = $1", [username])
	.then( (result) => {
		if(result.rowCount) {
			bcrypt.compare(password, result.rows[0].password, (err, success) => {
				if(err) {return responses.badReq(res, {message: "Could not Verify Details. Please Try Again."});}

				if(!success) {
					return responses.badReq(res, {message: "Incorrect Password"});
				}

				let token = jwt.sign({email: result.rows[0].email}, auth_pass, {expiresIn: '1h'});
				db.query("UPDATE users SET token = $1 WHERE id = $2", [token, result.rows[0].id])
				.then( (innerRes) => {
					if(innerRes.rowCount) {
						responses.successWHeaders(res, {token}, {message: "Login Successful", userid: result.rows[0].id});
					} else {
						responses.forbidden(res, {message: "Could not Establish Session"});
					}
				}).catch( (err) => {
					responses.badReq(res, {message: "Could not Establish Session. Please Try Again."});
				});
			});
		} else {
			responses.badReq(res, {message: "Invalid Username"});
		}
	}).catch( (err) => {
		responses.badReq(res, {message: "Could not Verify Details. Please Try Again."});
	});
};

exports.forgotPassword = (req, res) => {
	// E-mail Verification for Authentication
	let { email, password } = req.body;
	bcrypt.genSalt(10, (err, salt) => {
		if(err) {return responses.forbidden(res, {message: "Could not Secure Details. Please Try Again."});}
		
		bcrypt.hash(password, salt, (err, hash) => {
			if(err) {return responses.forbidden(res, {message: "Could not Secure Details. Please Try Again."});}

			db.query("UPDATE users SET password = $1 WHERE email = $2", [hash, email])
			.then( (result) => {
				if(result.rowCount) {
					responses.success(res, {message: "Password Changed Successfully"});
				} else {
					responses.badReq(res, {message: "Could not Change Password"});
				}
			}).catch( (err) => {
				responses.badReq(res, {message: "Could not Change Password. Please Try Again."});
			});
		});
	});
};

exports.logout = (req, res) => {
	// db.query("UPDATE users SET token = NULL WHERE token = $1", [req.headers.token]) // Single Session Only
	db.query("UPDATE users SET token = NULL WHERE id = $1", [req.query.userid])
	.then( (result) => {
		if(result.rowCount) {
			responses.success(res, {message: "Logout Successful"});
		} else {
			responses.badReq(res, {message: "Could not end Session"});
		}
	}).catch( (err) => {
		responses.badReq(res, {message: "Could not end Session. Please Try Again."});
	});
};





exports.getAll = (req, res) => {
	// db.query("SELECT profPic, name, username FROM users") // All Users
	db.query("SELECT profPic, name, username FROM users WHERE id <> $1", [req.query.userid])
	.then( (result) => {
		if(result.rowCount) {
			responses.success(res, {users: result.rows});
		} else {
			responses.success(res, {message: "No other users are currently available", users: []});
		}
	}).catch( (err) => {
		responses.badReq(res, {message: "Could not Fetch List. Please Try Again."});
	});
};

exports.getDetails = (req, res) => {
	db.query("SELECT profPic, name, username, email, mobile FROM users WHERE id = $1", [req.query.userid])
	.then( (result) => {
		if(result.rowCount) {
			responses.success(res, {user: result.rows[0]});
		} else {
			responses.forbidden(res, {message: "Invalid Request", user: {}});
		}
	}).catch( (err) => {
		responses.badReq(res, {message: "Could not Fetch Details. Please Try Again."});
	});
};

exports.updateProfile = (req, res) => {
	// E-Mail Update restricted as it is to be Verified
	let token = req.headers.token;
	let { mobile, name, username, userid } = req.body;
	let updQuery;
	
	if(req.file && req.file.originalname) {
		let image = req.file.originalname;
		updQuery = db.query("UPDATE users SET name = $1, username = $2, mobile = $3, profPic = $4 WHERE id = $5 AND token = $6", [name, username, mobile, image, userid, token]);
	} else {
		updQuery = db.query("UPDATE users SET name = $1, username = $2, mobile = $3, WHERE id = $4 AND token = $5", [name, username, mobile, userid, token]);
	}

	updQuery.then( (result) => {
		if(result.rowCount) {
			responses.success(res, {message: "Profile Updated Successfully"});
		} else {
			responses.success(res, {message: "Invalid Request"});
		}
	}).catch( (err) => {
		responses.badReq(res, {message: "Could not Update Profile. Please Try Again."});
	});
};

exports.deleteAccount = (req, res) => {
	db.query("DELETE FROM users WHERE token = $1 AND id = $2", [req.headers.token, req.body.userid])
	.then( (result) => {
		if(result.rowCount) {
			responses.success(res, {message: "Account Deleted Successfully"});
		} else {
			responses.forbidden(res, {message: "Invalid Request"});
		}
	}).catch( (err) => {
		responses.badReq(res, {message: "Could not Delete Account. Please Try Again."});
	});
};