import { klona } from 'klona';
import { join, resolve } from 'path';
import * as scoped from '../utils/scoped';
import * as utils from '../utils/index';
import * as log from '../utils/log';
import * as fs from '../utils/fs';
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

	function autoload(name: string) {
		log.info(`Applying ${ log.$pkg(name) } preset`);
		let abs = utils.from(cwd, join(name, 'config.js'));
		let tmp = require(abs); // allow potential throw
		if (tmp.rollup) customize.push(tmp.rollup);
		merge(options, tmp, context);
	}

	// auto-load @freshie packages
	scoped.list(cwd).forEach(autoload);

	if (file) {
		log.info(`Applying "${ log.$dir('freshie.config.js') }" config`);
		if (file.rollup) customize.push(file.rollup);
		merge(options, file, context);
	}

	const aliases = options.alias.entries;

	// update special aliases
	aliases['~assets'] = options.assets.dir;
	aliases['~routes'] = options.routes.dir;

	// resolve aliases
	for (let key in aliases) {
		let tmp = aliases[key];
		aliases[key] = resolve(src, tmp);
	}

	// find/parse "routes" directory
	const routes = await utils.routes(argv.src, options.routes);
	if (!routes.length) throw new Error('No routes found!');

	// auto-detect entries; set SSR fallback
	const entries = await fs.list(src).then(files => {
		// dom: index.{ext} || index.dom.{ext}
		let dom = fs.match(files, /index\.(dom\.)?[tjm]sx?$/);
		if (dom) dom = join(src, dom);

		// ssr: index.ssr.{ext}
		let ssr = fs.match(files, /index\.ssr\.[tjm]sx?$/);
		ssr = ssr ? join(src, ssr) : options.ssr.entry;

		// html: index.html || index.html.{ext}
		let html = fs.match(files, /index\.html(\.(svelte|vue|[tjm]sx?))?$/);
		if (html) html = join(src, html);

		return { dom, ssr, html };
	});

	if (!entries.dom) throw new Error('Missing "DOM" entry file!');
	if (!entries.html) throw new Error('Missing HTML template file!');

	// resolve copy list (from src dir)
	options.copy = options.copy.map(dir => {
		return resolve(src, dir);
	});

	// update *shared* replacements
	options.replace.__DEV__ = String(!isProd);
	options.replace['process.env.NODE_ENV'] = JSON.stringify(isProd ? 'production' : 'development');

	// build DOM configuration
	const client = Client(argv, routes, options, context);
	client.plugins.unshift(Plugin.HTML(entries.html, options));
	client.input = entries.dom; // inject entry point

	let server: Nullable<Rollup.Config>;

	// force node for dev
	if (argv.ssr && !isProd) {
		options.ssr.type = 'node';
	} else if (argv.ssr && !options.ssr.type) {
		autoload('@freshie/ssr.node');
		entries.ssr = entries.ssr || options.ssr.entry;
	} else if (!argv.ssr) {
		options.ssr.type = null; // --no-ssr
	}

	if (argv.ssr && options.ssr.type) {
		// Apply special SSR aliases
		scoped.list(cwd).forEach(name => {
			if (/[/]ui\./.test(name)) {
				aliases['~!!ui!!~'] = utils.from(cwd, name);
			}
		});

		// Create SSR bundle config
		server = Server(argv, routes, options, context);
		server.input = entries.ssr; // inject entry point
	}

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
		// NOTE: may detect & inject
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
			Plugin.Copy(options.copy),
			Plugin.Runtime(routes, true),
			Plugin.Summary({ isDOM: true }),
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
		// NOTE: may detect & inject
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
			Plugin.Summary({ isDOM: false }),
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
