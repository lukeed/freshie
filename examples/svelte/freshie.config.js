exports.rollup = function (config) {
	config.plugins.push(
		// @ts-ignore
		require('rollup-plugin-svelte')({
			hydratable: true,
			generate: 'dom',
			css: false,
		})
	)
}
