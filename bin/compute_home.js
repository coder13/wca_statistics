#!/usr/bin/env node

const Path = require('path');
const fs = require('fs');

fs.readdir(Path.resolve('statistics'), (err, files) => {
	let output = files.map(name => {
		let statistic = require(Path.resolve('statistics/' + name));
		return `- [${statistic.title}](${name.replace(/\.js/, '')})`;
	}).join('\n');

	fs.writeFile(Path.join('build/README.md'), output, function (err) {
		if (err) throw err;
		console.log(`Computed home page`);
	});
})