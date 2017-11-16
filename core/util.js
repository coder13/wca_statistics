module.exports.normalTable = (results, fields) => {
	let f = fields.map(field => field.name);
	return [f].concat(results.map(row => f.map(field => row[field])));
}
