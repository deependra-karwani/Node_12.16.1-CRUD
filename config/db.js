var poolConn = require('pg').Pool;

const { db_host:host, db_user:user, db_pass:password, db_name:database, db_port:port } = process.env;

const pool = new poolConn({
	host,
	port,
	user,
	password,
	database 
});

module.exports = pool;