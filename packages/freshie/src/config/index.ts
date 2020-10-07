import { klona } from 'klona';
import { join, resolve } from 'path';
import * as scoped from '../utils/scoped';
import * as utils from '../utils/index';
import { defaults } from './options';
import * as Plugin from './plugins';

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

export async function load(argv: Argv.Options): Promise<Config.Group> {
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

	// update special aliases
	options.alias.entries['~assets'] = options.assets.dir;
	options.alias.entries['~routes'] = options.routes.dir;

	// resolve aliases
	for (let key in options.alias.entries) {
		let tmp = options.alias.entries[key];
		options.alias.entries[key] = resolve(src, tmp);
	}

	const routes = await utils.routes(argv.src, options.routes);
	if (!routes.length) throw new Error('No routes found!');

	// replacements
	options.replace.__DEV__ = String(!isProd);
	options.replace['process.env.NODE_ENV'] = JSON.stringify(isProd ? 'production' : 'development');

	const client = Client(argv, routes, options, context);

	let server: Nullable<Rollup.Config>;

	// force node for dev
	if (argv.ssr && !isProd) {
		options.ssr.type = 'node';
	} else if (argv.ssr && !options.ssr.type) {
		// TODO: "cannot create SSR bundle without..."
		throw new Error('Missing `options.ssr.type` value!');
	} else if (argv.ssr) {
		// console.log('TODO: load `options.ssr` values')
		server = Server(argv, routes, options, context);
	} else {
		// --no-ssr
	}

	// auto-detect entries; set SSR entry
	await utils.list(src).then(files => {
		let ssr = '';

		files.forEach(rel => {
			if (/index\.(dom\.)?[tjm]sx?/.test(rel)) {
				client.input = join(src, rel);
			} else if (server) {
				ssr = ssr || (/index\.ssr\.[tjm]sx?/.test(rel) && rel);
			}
		});

		if (server && ssr) {
			server.input = join(src, ssr);
		} else if (server) {
			server.input = options.ssr.entry;
		}
	});

	customize.forEach(mutate => {
		mutate(client, options, context);
		if (server) mutate(server, options, context);
	});

	return { options, client, server };
}

export function Client(argv: Argv.Options, routes: Build.Route[], options: Config.Options, context: Config.Context): Rollup.Config {
	const { src, dest, minify } = argv;
	const { isProd } = context;

	return {
		input: join(src, 'index.dom.js'),
		output: {
			sourcemap: !isProd,
			dir: join(dest, 'client'),
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
			Plugin.Runtime(routes, true),
			require('@rollup/plugin-alias')(options.alias),
			// Assets.Plugin,
			require('@rollup/plugin-replace')({
				...options.replace,
				'__BROWSER__': 'true',
				'process.browser': 'true',
			}),
			require('@rollup/plugin-node-resolve').default({
				...options.resolve,
				rootDir: src
			}),
			require('@rollup/plugin-json')({
				compact: isProd,
				...options.json
			}),
			require('@rollup/plugin-commonjs')(options.commonjs),
			minify && require('rollup-plugin-terser').terser(options.terser)
		]
	};
}

export function Server(argv: Argv.Options, routes: Build.Route[], options: Config.Options, context: Config.Context): Rollup.Config {
	const { src, dest, minify } = argv;
	const { isProd } = context;

	return {
		// TODO: set via options.ssr.entry
		input: join(src, 'index.ssr.js'),
		output: {
			file: join(dest, 'server', 'index.js'),
			minifyInternalExports: isProd,
			sourcemap: !isProd,
		},
		treeshake: {
			propertyReadSideEffects: false,
			moduleSideEffects: 'no-external',
			tryCatchDeoptimization: false
		},
		plugins: [
			Plugin.Runtime(routes, false),
			require('@rollup/plugin-alias')(options.alias),
			// Assets.Plugin,
			require('@rollup/plugin-replace')({
				...options.replace,
				'__BROWSER__': 'false',
				'process.browser': 'false',
			}),
			require('@rollup/plugin-node-resolve').default({
				...options.resolve,
				rootDir: src
			}),
			require('@rollup/plugin-json')({
				compact: isProd,
				...options.json
			}),
			minify && require('rollup-plugin-terser').terser(options.terser)
		]
	};
}
