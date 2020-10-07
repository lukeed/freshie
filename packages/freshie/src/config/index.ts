import { klona } from 'klona';
import { join, resolve } from 'path';
import * as scoped from '../utils/scoped';
import * as utils from '../utils/index';
import { defaults } from './options';
import * as Plugin from './plugins';

// import { Runtime } from './plugins/runtime';

// modified pwa/core util
export function merge(old: Config.Options, nxt: Partial<Config.Options> | Config.Customize.Options, context: Config.Context) {
	for (let k in nxt) {
		if (k === 'rollup') continue;
		if (typeof nxt[k] === 'function') {
			old[k] = old[k] || {};
			nxt[k](old[k], context);
		} else {
			old[k] = nxt[k] || old[k];
		}
	}
}

export function load(argv: Argv.Options): {
	options: Config.Options;
	server?: Rollup.Config;
	client: Rollup.Config;
} {
	const { cwd, src, isProd } = argv;

	const file = utils.load<TODO>('freshie.config.js', cwd);

	// planning to mutate
	const options = klona(defaults);
	const customize: Config.Customize.Rollup[] = [];
	const context: Config.Context = { isProd, ssr: false }; // TODO: ssr value

	// auto-load @freshie packages
	scoped.list(cwd).forEach(name => {
		console.log(`Applying ${name}`);
		let abs = utils.from(cwd, join(name, 'config.js'));
		let tmp = require(abs); // allow potential throw
		if (tmp.rollup) customize.push(tmp.rollup);
		merge(options, tmp, context);
	});

	if (file) {
		console.log('loading custom config');
		if (file.rollup) customize.push(file.rollup);
		merge(options, file, context);
	}

	// resolve aliases
	for (let key in options.alias.entries) {
		let tmp = options.alias.entries[key];
		options.alias.entries[key] = resolve(src, tmp);
	}

	// replacements
	options.replace.__DEV__ = String(!isProd);
	options.replace['process.env.NODE_ENV'] = JSON.stringify(isProd ? 'production' : 'development');

	const client = Client(argv, options, context);

	let server: Nullable<Rollup.Config>;

	// TODO: Force local node SSR server for dev
	if (argv.ssr && !isProd) {
		console.log('TODO: force local ssr node server')
	} else if (argv.ssr) {
		console.log('TODO: load `options.ssr` values')
	} else {
		// --no-ssr
	}

	customize.forEach(mutate => {
		mutate(client, options, context);
		if (server) mutate(server, options, context);
	});

	return { options, client, server };
}

export function Client(argv: Argv.Options, options: Config.Options, context: Config.Context): Rollup.Config {
	const { src, dest, minify } = argv;
	const { isProd } = context;

	options.replace['__BROWSER__'] = options.replace['process.browser'] = 'true';

	return {
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
			Plugin.Router,
			require('@rollup/plugin-alias')(options.alias),
			// Assets.Plugin,
			require('@rollup/plugin-replace')(options.replace),
			require('@rollup/plugin-node-resolve').default({ ...options.resolve, rootDir: src }),
			require('@rollup/plugin-json')({ compact: isProd, ...options.json }),
			require('@rollup/plugin-commonjs')(options.commonjs),
			minify && require('rollup-plugin-terser').terser(options.terser)
		]
	};
}

// TODO: Server runs _after_ Client
export function Server(argv: Argv.Options, options: Config.Options, context: Config.Context): Rollup.Config {
	const { src, dest, minify } = argv;
	const { isProd } = context;

	options.replace['__BROWSER__'] = options.replace['process.browser'] = 'false';

	return {
		input: join(src, 'index.js'), // TODO: DEPLOY ENTRY
		output: {
			file: join(dest, 'index.js'),
			minifyInternalExports: isProd,
			sourcemap: !isProd,
		},
		treeshake: {
			propertyReadSideEffects: false,
			moduleSideEffects: 'no-external',
			tryCatchDeoptimization: false
		},
		plugins: [
			// require('@rollup/plugin-alias')(options.alias),
			// Assets.Plugin,
			require('@rollup/plugin-replace')(options.replace),
			require('@rollup/plugin-node-resolve').default({ ...options.resolve, rootDir: src }),
			require('@rollup/plugin-json')({ compact: isProd, ...options.json }),
			minify && require('rollup-plugin-terser').terser(options.terser)
		]
	};
}
