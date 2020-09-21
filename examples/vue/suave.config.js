exports.rollup = function (config) {
	config.plugins.push(
		// https://rollup-plugin-vue.vuejs.org/options.html
		require('rollup-plugin-vue')({
			css: false,
		})
	)
}
