#!/usr/bin/env node

const fs = require('fs');

if (!fs.existsSync('build')) {
	fs.mkdir('build');
}
