
const {forEach} = require('async-foreach');
const {query} = require('../core/database.js');
const {normalTable, nameWithLinkToWcaId, nameWithLinkToCompetitionId} = require('../core/util.js');
const md = require('../core/markdown');
const {events, eventNames, formatResult} = require('../core/wca.js');

module.exports = {
	title: 'Longest Standing Single PBs',

	query: () => `
		SELECT
			CSR.personId,
			personName,
			CSR.eventId,
			CSR.countryId,
			CSR.best single,
			DATE(CONCAT(year, '-', month, '-', day)) PBDate
		FROM (SELECT MIN(valueAndId) % 1000000000 id FROM ConciseSingleResults GROUP BY personId,eventId) PBs
		JOIN ConciseSingleResults CSR ON PBs.id = CSR.id 
		JOIN (SELECT personId,personName,eventId, MAX(date) mostRecent FROM ResultDates GROUP BY personId,personName,eventId) recent
			ON CSR.personId = recent.personId AND CSR.eventId = recent.eventId
		WHERE year(mostRecent) >= 2017
		ORDER BY PBDate
		LIMIT 100;
	`,

	run: function (cb) {
		let self = this;

		query(self.query(), (error, results, fields) => {
			if (error) {throw error;}

			let table = [['Person', 'Event', 'Country', 'Single', 'Date Set']].concat(results.map(row => {
				let person = nameWithLinkToWcaId(row.personName, row.personId);
				let event = eventNames[row.eventId];
				let single = formatResult(row.single, row.eventId, false);

				return [person, event, row.countryId, single, row.PBDate.toISOString().slice(0, 10)];
			}));

			let markdown = md.title(self.title) + md.table(table);

			cb(markdown);
		});
	}
};
