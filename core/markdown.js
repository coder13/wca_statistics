const mdTable = require('markdown-table');

module.exports = {
	title: (title) => `# ${title}\n\n`,

	description: (description) => description + '\n\n',

	table: (table, options) => mdTable(table, options) + '\n\n',
};
