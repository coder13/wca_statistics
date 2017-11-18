module.exports = {
	title: 'Most Comps',
	description: 'Most comps per person',

	query: `
		SELECT personId, name, COUNT(DISTINCT competitionId) comps FROM Results JOIN Persons ON Results.personId = Persons.id
		GROUP BY personId, name
		ORDER BY comps DESC
		LIMIT 15;
	`
};
