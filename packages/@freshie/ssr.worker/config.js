const { join } = require('path');

exports.ssr = function (config) {
	config.type = 'worker';
	// set fallback entry point
	config.entry = join(__dirname, 'entry.js');
}

exports.resolve = function (config, context) {
	if (!context.ssr) return;
	// redefine defaults if somehow missing
	config.mainFields = config.mainFields || ['module', 'jsnext', 'jsnext:main', 'main'];
	config.mainFields.unshift('worker'); // prefer "worker" entry if found
}

exports.rollup = function (config, context) {
	if (!context.ssr) return;
	config.output.format = 'esm';
	config.output.esModule = false;
	config.output.sourcemap = false;
	context.sourcemap = false;
}
