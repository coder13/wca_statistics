#!/usr/bin/env nodejs

const Path = require('path');
const fs = require('fs');

fs.readdir(Path.resolve('statistics'), (err, files) => {
	let output = files.map(name => `- [${name}](${name})`).join('\n');

	fs.writeFile(Path.join('build/README.md'), output, function (err) {
		if (err) {
			throw err;
		} else {
			console.log(`Computed home page`);
		}
	});
})