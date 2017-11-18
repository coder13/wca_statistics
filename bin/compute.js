#!/usr/bin/env node

const Path = require('path');
const fs = require('fs');
const glob = require('glob');
const {forEach} = require('async-foreach');
const Statistic = require('../core/statistic');
const {endConnection} = require('../core/database');

if (process.argv.length < 2) {
	console.error('Statistic not provided');
	process.exit();
}

const paths = process.argv.slice(2);
forEach(paths, function (path) {
	let doneRoot = this.async();

	forEach(glob.sync(path), function (statPath) {
		let done = this.async();

		console.log('Processing', statPath);
		const statistic = require(Path.resolve(statPath));

		(statistic.run || Statistic(statistic)).call(statistic, function (output, options) {
			if (output === null) {
				console.error('Output is null');
				done();
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
					done();
				});
			}
		});
	}, () => doneRoot());
}, () => endConnection());
