
const {forEach} = require('async-foreach');
const {query} = require('../core/database.js');
const {normalTable, nameWithLinkToWcaId, nameWithLinkToCompetitionId} = require('../core/util.js');
const md = require('../core/markdown');
const {events, eventNames, formatResult} = require('../core/wca.js');

module.exports = {
	title: 'Longest Standing PBs',

	query: () => `
		SELECT
			CAR1.personId,
			personName,
			CAR1.eventId,
			CAR1.countryId,
			CAR1.average average,
			DATE(CONCAT(year, '-', month, '-', day)) PBDate
		FROM ConciseAverageResults CAR1
		JOIN (SELECT personId,personName,eventId, MAX(date) mostRecent FROM ResultDates GROUP BY personId,personName,eventId) recent
		  ON CAR1.personId = recent.personId AND CAR1.eventId = recent.eventId
		WHERE year(mostRecent) >= 2017 AND CAR1.id = (
		  SELECT CAR2.id FROM ConciseAverageResults CAR2
		  WHERE CAR2.personId=CAR1.personId AND CAR2.eventId=CAR1.eventId
		  ORDER BY CAR2.year DESC, CAR2.month DESC, CAR2.day DESC
		  LIMIT 1
		)
		ORDER BY year,month,day
		LIMIT 100;
	`,

	run: function (cb) {
		let self = this;

		query(self.query(), (error, results, fields) => {
			if (error) {throw error;}

			let table = [['Person', 'Event', 'Country', 'Average', 'Date Set']].concat(results.map(row => {
				let person = nameWithLinkToWcaId(row.personName, row.personId);
				let event = eventNames[row.eventId];
				let average = formatResult(row.average, row.eventId, true);

				return [person, event, row.countryId, average, row.PBDate.toISOString().slice(0, 10)];
			}));

			let markdown = md.title(title) + md.table(table);

			cb(markdown);
		});
	}
};
