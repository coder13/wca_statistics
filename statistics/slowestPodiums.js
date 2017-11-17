const {forEach} = require('async-foreach');
const {query, endConnection} = require('../core/database.js');
const {normalTable, nameWithLink} = require('../core/util.js');
const md = require('../core/markdown');
const {events, eventNames, formatResult} = require('../core/wca.js');

module.exports = {
	title: 'Slowest podiums',
	description: '',

	query: (eventId) => `
		SELECT competitionId, ROUND(AVG(average)) Average, GROUP_CONCAT(personId,'|',personName,'|',average) Podium
		FROM Results
		WHERE roundTypeId in ('c', 'f') AND pos <= 3 AND eventId='${eventId}'
		GROUP BY competitionId HAVING min(best)>0 AND COUNT(*)=3
		ORDER BY SUM(average) DESC
		LIMIT 10;
	`,

	run: function (cb) {
		let self = this;
		let markdown = '';

		forEach(events, function (eventId) {
			let done = this.async();

			let results = query(self.query(eventId), (error, results, fields) => {
				if (error) {throw error;}

				let place = 0;
				let lastValue;

				let table = normalTable(results.map((row, index) => {
					if (lastValue !== row.Average) {
						place++;
						lastValue = row.Average;
					}

					row.Place = place;

					row.Average = formatResult(row.Average, eventId, true);
					row.Podium = row.Podium.split(',').map(p => p.split('|')).map(podium =>
						`${nameWithLink(podium[1], podium[0])} (${formatResult(podium[2])})`
					).join(', ');

					return row;
				}), [{name: 'Place'}].concat(fields));

				markdown += md.subHeader(eventNames[eventId], 3) + (results.length === 0 ? 'Not enough people per country for this event\n\n' : md.table(table));
				done();
			});
		}, () => {
			endConnection();
			cb(md.title(this.title) + markdown);
		});
	}
};
