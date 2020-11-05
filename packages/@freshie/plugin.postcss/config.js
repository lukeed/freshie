const { join } = require('path');

function installed(name) {
	try { return require.resolve(name) }
	catch (err) { return false }
}

exports.stylus = {
	//
}

exports.sass = {
	//
}

exports.cssnano = {
	//
}

exports.postcss = function (config, context) {
	const { sourcemap, isProd } = context;

	config.plugins = [].concat(config.plugins || []);
	config.sourcemap = sourcemap ? { inline: true } : false;

	config.modules = config.modules || {};
	config.modules.scopeBehaviour = 'local';
	config.modules.generateScopedName = '[name]__[local]___[hash:base64:5]';

	if (isProd) {
		config.modules.generateScopedName = '[hash:base64:5]';
		if (installed('autoprefixer')) {
			config.plugins.push(require('autoprefixer')());
		}
	}
}

// TODO: no-op writes/output when `ssr` context
// Will be using DOM output links anyway; ssr useless
exports.rollup = function (config, context, options) {
	const { isProd, minify } = context;
	const entries = options.alias.entries;

	if (isProd && minify && installed('cssnano')) {
		options.postcss.plugins.push(
			require('cssnano')(options.cssnano)
		);
	}

	options.postcss.server = context.ssr;

	// route-based CSS chunking/code-splitting
	options.postcss.extract = function (filename) {
		const relative = filename.replace(entries['~routes'], '');
		const match = /[\\\/+]?([^\\\/+]*)/i.exec(relative);
		if (!match) return 'index.css'; // commons

		let name = match[1].toLowerCase();
		if (!name.endsWith('.css')) name += '.css';
		return (name.startsWith('_') ? '' : 'r.') + name;
	};

	// Apply `~assets` alias to url() contents
	//=> support "~assets", "~@assets", or "@assets"
	options.postcss.assets = function (value) {
		if (/(\~?@|\~)assets[/]?/.test(value)) {
			let tmp = value.replace(/(\~?@|\~)assets[/]?/, '');
			return join(entries['~assets'], tmp);
		}
	};

	options.postcss.sass = { ...options.sass, ...options.postcss.sass };
	options.postcss.stylus = { ...options.stylus, ...options.postcss.stylus };
	options.postcss.less = { ...options.less, ...options.postcss.less };

	config.plugins.push(
		require('.')(options.postcss),
	);
}
