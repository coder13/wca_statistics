module.exports.normalTable = (results, fields) => {
	let f = fields.map(field => field.name);
	return [f].concat(results.map(row => f.map(field => row[field])));
};

module.exports.nameWithLink = (name, wca_id) => `[${name}](https://www.worldcubeassociation.org/persons/${wca_id})`;
