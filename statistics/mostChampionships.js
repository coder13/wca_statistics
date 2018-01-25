const {forEach} = require('async-foreach');
const {query} = require('../core/database.js');
const {normalTable, nameWithLinkToWcaId, nameWithLinkToCompetitionId} = require('../core/util.js');
const md = require('../core/markdown');
const {events, eventNames, formatResult} = require('../core/wca.js');

module.exports = {
	title: 'Most Championships',

	query: (region) => `
		SELECT
			personId,
			Persons.name,
			COUNT(competitionId) count,
			GROUP_CONCAT(competitionId ORDER BY R.year, R.month, R.day) competitions
		FROM (
			SELECT
				DISTINCT competitionId,
				personId,
				year,
				month,
				day
			FROM Results
			JOIN Competitions C ON Results.competitionId = C.id
		) R
		RIGHT JOIN championships ON R.competitionId = championships.competition_id
		JOIN Persons ON R.personId=Persons.id
		WHERE championship_type = '${region}' AND Persons.subid = 1
		GROUP BY personId, Persons.name
		ORDER BY count DESC LIMIT 25;
	`,

	regions: [['World', 'world'], ['Asia', '_Asia'], ['Europe', '_Europe'], ['United States', 'US'], ['South America', '_South America']],
	run: function (cb) {
		let self = this;
		let markdown = md.title(this.title);

		forEach(this.regions, function (region) {
			console.log('Running for region: ', region[0]);
			let done = this.async();

			markdown += md.subHeader(region[0], 3);

			query(self.query(region[1]), (error, results, fields) => {
				if (error) {throw error;}

				let table = [['Person', 'Championships', 'Competitions']].concat(results.map(row => {
					let person = nameWithLinkToWcaId(row.name, row.personId);
					let comps = row.competitions.split(',').map(comp => nameWithLinkToCompetitionId(comp, comp)).join(', ');

					return [person, row.count, comps];
				}));

				markdown += md.table(table);

				done();
			});
		}, () => {
			cb(markdown);
		});
	}
};
