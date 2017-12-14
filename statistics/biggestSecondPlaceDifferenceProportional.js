const {forEach} = require('async-foreach');
const {query} = require('../core/database.js');
const {normalTable, nameWithLinkToWcaId, nameWithLinkToCompetitionId} = require('../core/util.js');
const md = require('../core/markdown');
const {timedEvents, eventNames, formatResult} = require('../core/wca.js');

module.exports = {
	title: 'Biggest Proportional Difference Between Second and First Place',
	description: 'Biggest Proportional Difference Between Second and First Place',

	query: (eventId) => `
		SELECT
			format.sort_by,
			Competitions.id as competitionId,
			Competitions.name as competitionName,
			@first:= if(format.sort_by='average', F.average, F.best) as first,
			F.personId as firstPersonId,
			F.personName as firstPersonName,
			@second:= if(format.sort_by='average', S.average, S.best) as second,
			S.personId as secondPersonId,
			S.personName as secondPersonName,
			TRUNCATE(@second / @first * 100, 2) proportionalDifference
		FROM (SELECT competitionId, personId, personName, average, best FROM Results WHERE eventId='${eventId}' AND roundTypeId in ('c', 'f') AND pos = 1) F
		JOIN (SELECT competitionId, personId, personName, average, best FROM Results WHERE eventId='${eventId}' AND roundTypeId in ('c', 'f') AND pos = 2) S ON F.competitionId = S.competitionId
		JOIN preferred_formats pf ON pf.event_id = '${eventId}' AND ranking = 1
		JOIN Formats format ON format.id = pf.format_id
		JOIN Competitions ON F.competitionId = Competitions.id
		ORDER BY proportionalDifference DESC
		LIMIT 15;
	`,

	run: function (cb) {
		let self = this;
		let markdown = '';

		forEach(timedEvents, function (eventId) {
			let done = this.async();

			let results = query(self.query(eventId), (error, results, fields) => {
				if (error) {throw error;}

				let place = 0;
				let lastValue;

				let table = [['Place', 'Competition', 'First Place', 'Second Place', 'Difference']].concat(results.map(row => {
					if (lastValue !== row.proportionalDifference) {
						place++;
						lastValue = row.proportionalDifference;
					}

					let competitionName = nameWithLinkToCompetitionId(row.competitionName, row.competitionId + `/results/all#e${eventId}_f`);
					let first = `${formatResult(row.first)} (${nameWithLinkToWcaId(row.firstPersonName, row.firstPersonId)})`;
					let second = `${formatResult(row.second)} (${nameWithLinkToWcaId(row.secondPersonName, row.secondPersonId)})`;

					return [place, competitionName, first, second, row.proportionalDifference + '%'];
				}));

				markdown += md.subHeader(eventNames[eventId], 3) + md.table(table);
				done();
			});
		}, () => {
			cb(md.title(this.title) + markdown);
		});
	}
};
