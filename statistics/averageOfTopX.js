const {forEach} = require('async-foreach');
const {query} = require('../core/database.js');
const {normalTable, nameWithLinkToWcaId, nameWithLinkToCompetitionId} = require('../core/util.js');
const md = require('../core/markdown');
const {events, eventNames, formatResult} = require('../core/wca.js');

const Limit = 25;

module.exports = {
	title: (x) => `Average Of Top ${x}`,
	description: (x) => `Average of everyone in the top ${x} of the country`,

	query: (eventId, x) => `
		SELECT R.countryId country, (
			SELECT ROUND(AVG(if(Format.sort_by='average', RA.best, RS.best)))
				FROM RanksSingle RS
				LEFT JOIN RanksAverage RA ON RA.personId = RS.personId AND RA.eventId = RS.eventId
				JOIN preferred_formats pf ON pf.event_id = RS.eventId AND ranking = 1
				JOIN Formats Format ON Format.id = pf.format_id
				JOIN Persons P ON RS.personId=P.id
				WHERE subid=1 AND RS.eventId='${eventId}' AND if(Format.sort_by='average', RA.countryRank <= ${x}, RS.countryRank <= ${x}) AND P.countryId=R.countryId
			) average
		FROM (
			SELECT countryId, COUNT(*) count
			FROM Results
			WHERE eventId='${eventId}' AND best>0
			GROUP BY countryId
		) R
		WHERE R.count > ${x}
		ORDER BY average
		LIMIT ${Limit};
	`,

	translateResults: function (results, fields, eventId) {
		let place = 0;
		let lastValue;

		return [['Place', 'Country', 'Average']].concat(results.map(row => {
			if (lastValue !== row.average) {
				place++;
				lastValue = row.average;
			}

			let average = formatResult(row.average, eventId, true);
			return [place, row.country, average];
		}));
	},

	run: function (cb) {
		let self = this;

		let files = [];
		forEach([10, 25, 50], function (X) {
			let rootDone = this.async();
			let markdown = md.title(self.title(X)) + md.description(self.description(X));

			forEach(events, function (eventId) {
				let done = this.async();

				query(self.query(eventId, X), (error, results, fields) => {
					if (error) {throw error;}

					let table = self.translateResults(results, fields, eventId);

					markdown += md.subHeader(eventNames[eventId], 3) + (results.length === 0 ? 'Not enough people per country for this event\n\n' : md.table(table));

					done();
				});

			}, () => {
				files.push({
					fileName: 'top/' + X,
					output:  markdown
				});
				rootDone();
			});
		}, () => {
			cb(files);
		});
	}
};
