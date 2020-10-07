export const defaults: Config.Options = {
	publicPath: '/',

	alias: {
		entries: {
			// src resolve
			'~routes': '', // injected
			'~components': 'components',
			'~assets': '', // injected
			'~utils': 'utils',
			'~tags': 'tags',
		}
	},

	ssr: {
		type: null,
		entry: null,
	},

	routes: {
		dir: 'routes',
		test: /\.([tj]sx?|svelte|vue)$/,
		layout: /^_layout/,
	},

	assets: {
		dir: 'assets',
		test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)$/,
	},

	replace: {
		// updated
		'__DEV__': 'true',
		'__BROWSER__': 'true',
		'process.browser': 'true',
		'process.env.NODE_ENV': 'development',
	},

	resolve: {
		extensions: ['.mjs', '.js', '.jsx', '.json'],
		mainFields: ['browser', 'module', 'jsnext', 'main'],
	},

	commonjs: {
		extensions: ['.js', '.cjs']
	},

	json: {
		preferConst: true,
		namedExports: true,
		indent: '  ',
	},

	terser: {
		mangle: true,
		compress: true,
		output: {
			comments: false
		}
	}
}
