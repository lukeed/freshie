import { klona } from 'klona';
import { join, resolve } from 'path';
import * as scoped from '../utils/scoped';
import * as utils from '../utils/index';
import * as log from '../utils/log';
import { defaults } from './options';
import * as Plugin from './plugins';

import type { Asset } from 'rollup-route-manifest';

type ConfigData = Partial<Config.Customize.Options> & {
	rollup?: Config.Customize.Rollup
};

interface ConfigPair {
	options: Config.Options;
	context: Config.Context;
}

// modified pwa/core util
export function merge(old: Config.Options, nxt: ConfigData, context: Config.Context) {
	for (let k in nxt) {
		if (k === 'rollup') continue;
		if (typeof nxt[k] === 'function') {
			old[k] = old[k] || {};
			nxt[k](old[k], context); // TODO? pass `old|options` 2nd
		} else {
			old[k] = nxt[k] || old[k];
		}
	}
}

function assemble(configs: ConfigData[], argv: Argv.Options, ssr = false): ConfigPair {
	const options = klona(defaults);
	const { src, minify, isProd, cwd, sourcemap } = argv;
	const context: Config.Context = { ssr, minify, isProd, sourcemap, src, cwd };
	configs.forEach(tmp => merge(options, tmp, context));

	const aliases = options.alias.entries;

	// update special aliases
	aliases['~assets'] = options.assets.dir;
	aliases['~routes'] = options.templates.routes;

	// resolve aliases
	for (let key in aliases) {
		let tmp = aliases[key];
		aliases[key] = resolve(src, tmp);
	}

	// resolve copy list (from src dir)
	options.copy = options.copy.map(dir => resolve(src, dir));

	// update *shared* replacements
	options.replace.__DEV__ = String(!isProd);
	options.replace['process.env.NODE_ENV'] = JSON.stringify(isProd ? 'production' : 'development');

	return { options, context };
}

// TODO: save `merge` functions and apply twice (ssr vs dom)
export async function load(argv: Argv.Options): Promise<Config.Group> {
	const { cwd, src, isProd } = argv;

	const file = utils.load<ConfigData>('freshie.config.js', cwd);

	const configs: ConfigData[] = [];
	const customize: Config.Customize.Rollup[] = [];
	let DOM: ConfigPair, SSR: ConfigPair, uikit: string;

	function autoload(name: string) {
		log.info(`Applying ${ log.$pkg(name) } preset`);
		let abs = utils.from(cwd, join(name, 'config.js'));
		let { rollup, ...rest } = require(abs) as ConfigData;
		if (/[/]ui\./.test(name)) uikit = uikit || name;
		if (rollup) customize.push(rollup);
		configs.push(rest);
	}

	// auto-load @freshie packages
	scoped.list(cwd).forEach(autoload);

	if (file) {
		log.info(`Applying "${ log.$dir('freshie.config.js') }" config`);
		let { rollup, ...rest } = file;
		if (rollup) customize.push(rollup);
		configs.push(rest);
	}

	// build base/client options
	DOM = assemble(configs, argv);
	const { options } = DOM; //=> "base"

	// find/parse "routes" directory
	const routes = await utils.routes(src, options.templates);
	if (!routes.length) throw new Error('No routes found!');

	// find/parse "errors" directory
	// TODO: global default, regardless of uikit?
	const errors = await utils.errors(src, options.templates);
	if (uikit && !errors.find(x => x.key === 'xxx')) errors.push({
		file: options.alias.entries['!!~error~!!'],
		layout: null,
		key: 'xxx',
	});

	// auto-detect entry points, w/ SSR fallback
	const entries = await utils.entries(src, options);

	// build DOM configuration
	const client = Client(argv, routes, entries, errors, DOM.options, DOM.context);

	let server: Rollup.Config;

	// force node for dev
	if (argv.ssr && !isProd) {
		options.ssr.type = 'node';
	} else if (argv.ssr && !options.ssr.type) {
		autoload('@freshie/ssr.node');
		argv.ssr = true; // forced
	} else if (!argv.ssr) {
		options.ssr.type = null; // --no-ssr
	}

	if (argv.ssr) {
		// build server options w/ context
		SSR = assemble(configs, argv, true);

		if (!SSR.options.ssr.type) {
			SSR.options.ssr = options.ssr;
		}

		if (uikit) {
			SSR.options.alias.entries['!!~ui~!!'] = utils.from(cwd, uikit);
		} // else error?

		// Create SSR bundle config
		server = Server(argv, routes, entries, errors, SSR.options, SSR.context);
	}

	customize.forEach(mutate => {
		mutate(client, DOM.context, DOM.options);
		if (server) mutate(server, SSR.context, SSR.options);
	});

	// Summaries must be last
	client.plugins.push(Plugin.Summary({ isDOM: true }));
	if (server) server.plugins.push(Plugin.Summary({ isDOM: false }));

	return { options, client, server };
}

export function Client(argv: Argv.Options, routes: Build.Route[], entries: Build.Entries, errors: Build.Error[], options: Config.Options, context: Config.Context): Rollup.Config {
	const { src, isProd, minify, sourcemap } = context;

	return {
		input: entries.dom,
		output: {
			sourcemap: !!sourcemap,
			dir: join(argv.dest, 'client'),
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
			Plugin.Copy(options.copy),
			Plugin.HTML(entries.html, options),
			Plugin.Runtime(src, routes, errors, true),
			require('@rollup/plugin-alias')(options.alias),
			// Assets.Plugin,
			require('@rollup/plugin-replace')({
				...options.replace,
				'__BROWSER__': 'true',
				'process.browser': 'true',
			}),
			require('@rollup/plugin-node-resolve').default({
				browser: true,
				...options.resolve,
				rootDir: src
			}),
			require('@rollup/plugin-json')({
				compact: isProd,
				...options.json
			}),
			// for CLIENT runtime
			require('rollup-route-manifest')({
				merge: true,
				inline: true,
				headers: false,
				filename: false,
				routes(file: string) {
					if (file === entries.dom) {
						console.log('FOUND', file);
						return '*';
					}
					for (let i=0; i < routes.length; i++) {
						if (routes[i].file === file) return routes[i].pattern;
					}
				},
				format(files: Asset[]) {
					return files.map(x => x.href);
				}
			}),
			require('@rollup/plugin-commonjs')(options.commonjs),
			minify && require('rollup-plugin-terser').terser(options.terser)
		]
	};
}

export function Server(argv: Argv.Options, routes: Build.Route[], entries: Build.Entries, errors: Build.Error[], options: Config.Options, context: Config.Context): Rollup.Config {
	const { src, isProd, minify, sourcemap } = context;

	const template = join(argv.dest, 'client', 'index.html');

	return {
		input: entries.ssr || options.ssr.entry || join(src, 'index.ssr.js'),
		output: {
			file: join(argv.dest, 'server', 'index.js'),
			minifyInternalExports: isProd,
			sourcemap: !!sourcemap,
		},
		treeshake: {
			propertyReadSideEffects: false,
			moduleSideEffects: 'no-external',
			tryCatchDeoptimization: false
		},
		plugins: [
			Plugin.Template(template),
			Plugin.Runtime(src, routes, errors, false),
			require('@rollup/plugin-alias')(options.alias),
			// Assets.Plugin,
			require('@rollup/plugin-replace')({
				...options.replace,
				'__BROWSER__': 'false',
				'process.browser': 'false',
			}),
			require('@rollup/plugin-node-resolve').default({
				browser: false,
				...options.resolve,
				rootDir: src,
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
