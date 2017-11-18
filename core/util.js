module.exports.normalTable = (results, fields) => {
	let f = fields.map(field => field.name);
	return [f].concat(results.map(row => f.map(field => row[field])));
};

module.exports.nameWithLinkToWcaId = (name, wca_id) => `[${name}](https://www.worldcubeassociation.org/persons/${wca_id})`;
module.exports.nameWithLinkToCompetitionId = (name, wca_id) => `[${name}](https://www.worldcubeassociation.org/competitions/${wca_id})`;
