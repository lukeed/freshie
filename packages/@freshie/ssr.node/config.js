const { join } = require('path');

exports.ssr = function (config) {
	config.type = 'node';
	// set fallback entry point
	config.entry = join(__dirname, 'entry.js');
}

exports.rollup = function (config, context) {
	if (!context.ssr) return;
	config.output.format = 'cjs';
	config.output.esModule = false;
	config.external = [
		...(config.external || []),
		...require('module').builtinModules,
	];
}
