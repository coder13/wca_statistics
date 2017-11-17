const {query} = require('../core/database.js');
const {normalTable} = require('../core/util.js');
const md = require('../core/markdown');

module.exports = {
	title: 'Most Comps',
	description: 'Most comps per person',

	query: `
		SELECT personId, personName, COUNT(DISTINCT competitionId) comps FROM Results
		GROUP BY personId, personName
		ORDER BY comps DESC
		LIMIT 15;
	`,

	run: function (cb) {
		let results = query(this.query, (error, results, fields) => {
			if (error) {throw error;}

			let table = normalTable(results, fields);

			let markdown = md.title(this.title) + md.description(this.description) + md.table(table);

			cb(markdown);
		});
	}
};
