const {query} = require('../core/database.js');
const {normalTable} = require('../core/util.js');
const md = require('../core/markdown');

module.exports = function (cb) {
	let title = 'Most Comps';
	let description = `Most comps per person`;

	let results = query(`
		SELECT personId, personName, COUNT(DISTINCT competitionId) comps FROM Results
		GROUP BY personId, personName
		ORDER BY comps DESC
		LIMIT 10;
	`, function (error, results, fields) {
		if (error) throw erorr;;
		
		let table = normalTable(results, fields);

		let markdown = md.title(title) + md.description(description) + md.table(table);

		cb(markdown);
	});
};
