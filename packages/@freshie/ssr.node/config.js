const { join } = require('path');

exports.ssr = function (config) {
	config.type = 'node';
	// set fallback entry point
	config.entry = join(__dirname, 'entry.js');
}
