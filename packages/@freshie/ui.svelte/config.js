exports.svelte = {
	hydratable: true,
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
