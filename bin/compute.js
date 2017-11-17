#!/usr/bin/env node

const Path = require('path');
const fs = require('fs');

if (process.argv.length < 2) {
	console.error('Statistic not provided');
	process.exit();
}

const paths = process.argv.slice(2);
paths.forEach(statPath => {
	console.log('Processing', statPath);
	const statistic = require(Path.resolve(statPath));

	statistic.run(function (output, options) {
		if (output === null) {
			console.error('Output is null');
		} else {
			let fileName = '';
			if (options && options.fileName) {
				fileName = Path.join('build', options.fileName + '.md');
			} else {
				fileName = Path.join('build', Path.basename(statPath).replace(/\.js/, '') + '.md');
			}

			fs.writeFile(fileName, output, function (error) {
				if (error) {throw error;}

				console.log(`Computed ${statPath} and exported to ${fileName}`);
			});
		}
	});
});
