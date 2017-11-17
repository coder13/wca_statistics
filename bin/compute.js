#!/usr/bin/env node

const Path = require('path');
const fs = require('fs');

if (process.argv.length < 2) {
	console.error('Statistic not provided');
	process.exit();
}

const paths = process.argv.slice(2);
paths.forEach(statPath => {
	const statistic = require(Path.resolve(statPath));

	let fileName = Path.join('build', Path.basename(statPath).replace(/\.js/, '') + '.md');

	statistic(function (output) {
		fs.writeFile(fileName, output, function (err) {
			console.log(`Computed ${statPath} and exported to ${fileName}`);
		});
	});
});
