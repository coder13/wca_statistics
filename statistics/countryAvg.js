const {forEach} = require('async-foreach');
const {query, endConnection} = require('../core/database.js');
const {normalTable} = require('../core/util.js');
const md = require('../core/markdown.js');
const {events, eventNames, formatResult} = require('../core/wca.js');

const percent = 5;
const minPop = 100;

module.exports = {
	title: 'Average of Top X% of Countries',
	description: `Average of Countries Ranked By top ${percent}% with a minimum event population of ${minPop}`,

	query: (eventId) => `
		SELECT R.countryId Country, R.count Population, (
			SELECT ROUND(AVG(best))
				FROM RanksAverage RA JOIN Persons P ON RA.personId=P.id
				WHERE subid=1 AND eventId='${eventId}' AND countryRank <= CEIL(R.count*${percent / 100}) AND P.countryId=R.countryId) Average
		FROM (
			SELECT countryId, COUNT(*) count
			FROM Results
			WHERE eventId='${eventId}' AND average>0 AND best>0
			GROUP BY countryId
		) R
		HAVING average > 0 AND R.count > (${minPop})
		ORDER BY average
		LIMIT 50;
	`,

	run: function (cb) {
		let self = this;
		let markdown = '';

		forEach(events, function (eventId) {
			let done = this.async();

			let results = query(self.query(eventId), (error, results, fields) => {
				if (error) {throw error;}

				let table = normalTable(results.map(row => {
					row.Average = formatResult(row.Average, eventId, true);
					return row;
				}), fields);

				markdown += md.subHeader(eventNames[eventId], 3) + (results.length === 0 ? 'Not enough people per country for this event\n\n' : md.table(table));
				done();
			});
		}, () => {
			endConnection();
			cb(md.title(this.title) + md.description(this.description) + markdown);
		});

	}
};
