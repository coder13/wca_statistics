const {forEach} = require('async-foreach');
const {query} = require('../core/database.js');
const {normalTable, nameWithLinkToWcaId, nameWithLinkToCompetitionId} = require('../core/util.js');
const md = require('../core/markdown');
const {timedEvents, eventNames, formatResult} = require('../core/wca.js');

module.exports = {
	title: 'Biggest Difference Between Second and First Place',
	description: 'Biggest Difference Between Second and First Place',

	query: (eventId) => `
		SELECT
			Competitions.id as competitionId,
			Competitions.name as competitionName,
			F.average as firstAverage,
			F.personId as firstPersonId,
			F.personName as firstPersonName,
			S.average as secondAverage,
			S.personId as secondPersonId,
			S.personName as secondPersonName,
			S.average - F.average difference
		FROM (SELECT competitionId, personId, personName, average FROM Results WHERE eventId='${eventId}' AND roundTypeId='f' AND pos = 1) F
		JOIN (SELECT competitionId, personId, personName, average FROM Results WHERE eventId='${eventId}' AND roundTypeId='f' AND pos = 2) S ON F.competitionId = S.competitionId
		JOIN Competitions ON F.competitionId = Competitions.id
		ORDER BY Difference DESC
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
					if (lastValue !== row.difference) {
						place++;
						lastValue = row.difference;
					}

					let competitionName = nameWithLinkToCompetitionId(row.competitionName, row.competitionId + `/results/all#e${eventId}_f`);
					let first = `${formatResult(row.firstAverage)} (${nameWithLinkToWcaId(row.firstPersonName, row.firstPersonId)})`;
					let second = `${formatResult(row.secondAverage)} (${nameWithLinkToWcaId(row.secondPersonName, row.secondPersonId)})`;

					return [place, competitionName, first, second, formatResult(row.difference)];
				}));

				markdown += md.subHeader(eventNames[eventId], 3) + md.table(table);
				done();
			});
		}, () => {
			cb(md.title(this.title) + markdown);
		});
	}
};
