import { klona } from 'klona';
import { join, resolve } from 'path';
import * as scoped from './scoped';
import * as utils from './index';

export const defaults: Config.Options = {
	publicPath: '/',

	alias: {
		entries: {
			// src resolve
			'~routes': 'routes',
			'~components': 'components',
			'~assets': 'assets',
			'~utils': 'utils',
			'~tags': 'tags',
		}
	},

	routes: {
		dir: 'routes',
		test: /\.[tj]sx?$/
	},

	assets: {
		test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)$/,
	},

	replace: {
		// updated
		'__DEV__': 'true',
		'__BROWSER__': 'true',
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

// modified pwa/core util
export function merge(old: Config.Options, nxt: Dict<TODO>, args: TODO) {
	for (let k in nxt) {
		if (k === 'rollup') continue;
		if (typeof nxt[k] === 'function') {
			old[k] = old[k] || {};
			nxt[k](old[k], args);
		} else {
			old[k] = nxt[k] || old[k];
		}
	}
}

type Customizer = (config: Config.Rollup, val: TODO, options: Config.Options) => void;

// TODO: return multiple configs [browser, server]
// TODO: `defaults` modifiers vs `rollup` config
// ~> return { config, customize[] } shape
export function load(argv: Argv.Options): Config.Rollup {
	const { cwd, dest, src, minify, isProd } = argv;

	const file = utils.load<TODO>('freshie.config.js', cwd);

	// planning to mutate
	const options = klona(defaults);
	const customize: Customizer[] = [];

	// auto-load @freshie packages
	scoped.list(cwd).forEach(name => {
		console.log(`Applying ${name}`);
		let file = utils.from(cwd, join(name, 'config.js'));
		let tmp = require(file); // allow potential throw
		if (tmp.rollup) customize.push(tmp.rollup);
		merge(options, tmp, {}); // TODO
	});

	if (file) {
		console.log('loading custom config');
		if (file.rollup) customize.push(file.rollup);
		merge(options, file, {}); // TODO
	}

	// TODO: apply non-function options immediately
	// TODO: return { options, functions[], customize  }

	// resolve aliases
	for (let key in options.alias.entries) {
		let tmp = options.alias.entries[key];
		options.alias.entries[key] = resolve(src, tmp);
	}

	// replacements
	options.replace.__DEV__ = String(!isProd);
	options.replace['process.env.NODE_ENV'] = JSON.stringify(isProd ? 'production' : 'development');

	const config: Config.Rollup = {
		input: join(src, 'index.js'),
		output: {
			dir: dest,
			sourcemap: !isProd,
			minifyInternalExports: isProd,
			entryFileNames: isProd ? '[name].[hash].js' : '[name].js',
			assetFileNames: isProd ? '[name].[hash].[ext]' : '[name].[ext]',
			chunkFileNames: isProd ? '[name].[hash].js' : '[name].js',
		},
		preserveEntrySignatures: isProd ? false : 'strict',
		treeshake: isProd && {
			moduleSideEffects: 'no-external',
			tryCatchDeoptimization: false
		},
		plugins: [
			require('@rollup/plugin-alias')(options.alias),
			// Assets.Plugin,
			require('@rollup/plugin-node-resolve').default({
				...options.resolve,
				rootDir: src,
			}),
			require('@rollup/plugin-commonjs')(options.commonjs),
			require('@rollup/plugin-replace')(options.replace),
			require('@rollup/plugin-json')({
				compact: isProd,
				...options.json
			}),
			minify && require('rollup-plugin-terser').terser(options.terser)
		]
	};

	customize.forEach(mutate => {
		mutate(config, {}, options);
	});

	return config;
}
