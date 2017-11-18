const {forEach} = require('async-foreach');
const {query} = require('../core/database.js');
const {normalTable, nameWithLinkToWcaId, nameWithLinkToCompetitionId} = require('../core/util.js');
const md = require('../core/markdown');
const {events, eventNames, formatResult} = require('../core/wca.js');

module.exports = {
	title: 'Slowest podiums',
	description: '',

	query: (eventId) => `
		SELECT
			format.sort_by,
			competitionId competitionId,
			Competitions.name competitionName,
			roundTypeId,
			ROUND(AVG(average)) average,
			ROUND(AVG(best)) single,
			GROUP_CONCAT(personId,'|',personName,'|',average,'|',best) podium
		FROM Results
		JOIN Competitions ON Results.competitionId = Competitions.id
		JOIN preferred_formats pf ON pf.event_id = eventId AND ranking = 1
		JOIN Formats format ON format.id = pf.format_id
		WHERE roundTypeId in ('c', 'f') AND pos <= 3 AND eventId='${eventId}'
		GROUP BY competitionId,roundTypeId,sort_by
		HAVING min(best)>0 AND COUNT(*)=3
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

				let table = [['Place', 'Competition', 'Average', 'Podium']].concat(results.map(row => {
					if (lastValue !== row[row.sort_by]) {
						place++;
						lastValue = row[row.sort_by];
					}

					let competitionName = nameWithLinkToCompetitionId(row.competitionName, row.competitionId + `/results/all#e${eventId}_${row.roundTypeId}`);
					let average = formatResult(row[row.sort_by], eventId, true);

					let podium = row.podium.split(',').map(p => p.split('|')).map(podium =>
						`${nameWithLinkToWcaId(podium[1], podium[0])} (${formatResult(row.sort_by === 'average' ? podium[2] : podium[3], eventId, true)})`
					).join(', ');

					return [place, competitionName, average, podium];
				}));

				markdown += md.subHeader(eventNames[eventId], 3) + (results.length === 0 ? 'Not enough people per country for this event\n\n' : md.table(table));
				done();
			});
		}, () => {
			cb(md.title(this.title) + markdown);
		});
	}
};
