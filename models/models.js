const db = require('../config/db');

db.query("CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, profPic VARCHAR(255), email VARCHAR(254) NOT NULL UNIQUE, mobile CHAR(10), username VARCHAR(50) NOT NULL UNIQUE, password CHAR(64) NOT NULL, fcm TEXT, token VARCHAR(255) UNIQUE)").then( () => {
	console.log("Users Table Created if did not Exist");
}).catch( (err) => {
	console.log("Users Table Error: ", err);
});