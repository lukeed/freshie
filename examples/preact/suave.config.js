exports.rollup = function (config) {
	config.plugins.push(
		require('@rollup/plugin-babel').default({
			babelHelpers: 'bundled',
			plugins: [
				['@babel/plugin-transform-react-jsx', {
					pragma: 'h',
					pragmaFrag: 'Fragment'
				}]
			]
		})
	)
}
