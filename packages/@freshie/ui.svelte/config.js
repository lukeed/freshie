const { join } = require('path');

exports.svelte = {
	hydratable: true,
}

exports.alias = function (config) {
	config.entries['~!!error!!~'] = join(__dirname, '_error.svelte');
}

// TODO: load CWD/svelte.config.js values
exports.rollup = function (config, context, options) {
	config.plugins.push(
		require('rollup-plugin-svelte')({
			css: context.ssr ? false : (css => css.write('index.css')),
			generate: context.ssr ? 'ssr' : 'dom',
			...options.svelte,
		})
	);
}
