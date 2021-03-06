#!/usr/bin/env node

const Path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const glob = require('glob');
const {forEach} = require('async-foreach');
const Statistic = require('../core/statistic');
const {endConnection} = require('../core/database');

if (process.argv.length < 2) {
	console.error('Statistic not provided');
	process.exit();
}

const writeFile = function (path, contents, cb) {
	mkdirp(Path.dirname(path), function (error) {
		if (error) {return cb(error);}

		fs.writeFile(path, contents, cb);
	});
};

const writeToFile = function (output, statPath, cb, options) {
	let fileName = '';
	if (options && options.fileName) {
		fileName = Path.join('build', options.fileName + '.md');
		console.log(options.fileName);
	} else {
		fileName = Path.join('build', statPath.split('/')[1].replace(/\.js/, '') + '.md');
	}

	writeFile(fileName, output, function (error) {
		if (error) {throw error;}
		console.log(`Computed ${statPath} and exported to ${fileName}`);
		cb();
	});
};

const paths = process.argv.slice(2);
forEach(paths, function (path) {
	let doneRoot = this.async();

	forEach(glob.sync(path), function (statPath) {
		let done = this.async();

		console.log('Processing', statPath);
		const statistic = require(Path.resolve(statPath));

		(statistic.run || Statistic(statistic)).call(statistic, function (output, options) {
			if (Array.isArray(output) && output.length > 0) {
				forEach(output, function (file) {
					let _done = this.async();

					writeToFile(file.output, file.fileName, _done, file.options);
				}, function () {
					done();
				});
			} else if (output) {
				writeToFile(output, statPath, done, options);
			} else {
				console.error('Output is null');
				done();
			}
		});
	}, () => doneRoot());
}, () => endConnection());
