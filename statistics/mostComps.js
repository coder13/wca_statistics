module.exports = {
	title: 'Most Comps',
	description: 'Most comps per person',

	query: `
		SELECT personId, name, COUNT(DISTINCT competitionId) comps
		FROM Results
		JOIN Persons ON Results.personId = Persons.id AND Persons.subId = 1
		GROUP BY personId, name
		ORDER BY comps DESC
		LIMIT 100;
	`
};
