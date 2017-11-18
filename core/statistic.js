const {query} = require('../core/database.js');
const {normalTable} = require('../core/util.js');
const md = require('../core/markdown');

module.exports = function (stat) {
	return function (cb) {
		let results = query(stat.query, (error, results, fields) => {
			if (error) {throw error;}

			let table = normalTable(results, fields);

			let markdown = md.title(stat.title) + md.description(stat.description) + md.table(table);

			cb(markdown);
		});
	};
};
