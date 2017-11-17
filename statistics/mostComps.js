const {query, endConnection} = require('../core/database.js');
const {normalTable} = require('../core/util.js');
const md = require('../core/markdown');

module.exports = {
	title: 'Most Comps',
	description: 'Most comps per person',

	query: `
		SELECT personId, name, COUNT(DISTINCT competitionId) comps FROM Results JOIN Persons ON Results.personId = Persons.id
		GROUP BY personId, name
		ORDER BY comps DESC
		LIMIT 15;
	`
};
