#!/usr/bin/env node

const Path = require('path');
const fs = require('fs');

fs.readdir(Path.resolve('statistics'), (err, files) => {
  files.forEach(file => {
    let statPath = process.argv[2];
    const statistic = require(Path.resolve(statPath));

    let fileName = Path.join('build', Path.basename(statPath).replace(/\.js/, '') + '.md');

    statistic(function (output) {
    	fs.writeFile(fileName, output, function () {
    		console.log(`Computed ${statPath} and exported to ${fileName}`);
    	});
    });
  });
})