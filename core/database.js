const config = require('../config');
const mysql = require('mysql');
const connection = mysql.createConnection(config.mysql);

module.exports.mysql = mysql;
module.exports.connection = connection;

module.exports.query = function (query, cb) {
	if (query.indexOf('LIMIT') === -1) {
		throw 'No LIMIT specified!';
	}

	connection.query(query, function (error, results, fields) {
		if (error) {
			connection.end();
			throw error;
		} else {
			cb(null, results, fields);
			connection.end();
		}
	});
};
