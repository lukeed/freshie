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

	templates: {
		routes: 'routes',
		layout: /^_layout/,
		test: /\.([tj]sx?|svelte|vue)$/,
		errors: 'errors',
	},

	assets: {
		dir: 'assets',
		test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)$/,
	},

	copy: ['static', 'public'],

	replace: {
		// updated
		'__DEV__': 'true',
		'__BROWSER__': 'true',
		'process.browser': 'true',
		'process.env.NODE_ENV': 'development',
		'__SSR__': 'true',
	},

	resolve: {
		extensions: ['.mjs', '.js', '.jsx', '.json'],
		mainFields: ['module', 'jsnext', 'jsnext:main', 'main'],
	},

	commonjs: {
		extensions: ['.js', '.cjs']
	},

	json: {
		preferConst: true,
		namedExports: true,
		indent: '  ',
	}
}
