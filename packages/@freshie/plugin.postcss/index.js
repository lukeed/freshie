const { basename } = require('path');
const { existsSync, readFile, readFileSync } = require('fs');
const { promisify } = require('util');
const postcss = require('postcss');

const read = promisify(readFile);
let render_stylus, render_less, render_sass;

function load(name) {
	try { return require(name) }
	catch (e) { throw new Error(`\nPlease install the "${name}" package:\n  $ npm install --save-dev ${name}`) }
}

function stylus(filename, filedata, sourcemap, options={}) {
	if (!render_stylus) render_stylus = load('stylus');

	options.filename = filename;
	if (sourcemap) options.sourcemap={ comment: false };

	let ctx = render_stylus(filedata, options);

	return new Promise((res, rej) => {
		ctx.render((err, css) => {
			let map = sourcemap && ctx.sourcemap;
			return err ? rej(err) : res({ css, map });
		});
	});
}

function sass(filename, filedata, sourcemap, options={}) {
	if (!render_sass) render_sass = load('node-sass').render;

	const indentedSyntax = /\.sass$/.test(filename);
	options.data = filedata;
	options.file = filename;

	if (sourcemap) {
		options.outFile = filename.replace(/\.s[ac]ss$/, '.css');
		options.sourceMap = true;
	}

	return new Promise((res, rej) => {
		render_sass({ ...options, indentedSyntax }, (err, result) => {
			return err ? rej(err) : res({
				css: result.css.toString(),
				map: result.map && result.map.toString()
			});
		});
	});
}

function less(filename, filedata, sourcemap, options={}) {
	if (!render_less) {
		render_less = load('less').render;
	}

	options.filename = filename;
	if (sourcemap) options.sourceMap={};
	return render_less(filedata, options);
}

module.exports = function (opts={}) {
	const { plugins=[], assets, extract, sourcemap, server, ...rest } = opts;

	let toExtract = false;
	const FILES = new Map, REFS = new Map;
	if (typeof extract === 'string') toExtract = () => extract;
	else if (typeof extract === 'function') toExtract = extract;
	else if (extract === true) toExtract = () => 'bundle.css';

	const toMap = sourcemap != null && !!sourcemap;
	const RUNTIME = require.resolve('./runtime.js');
	const IDENT = '!!~freshie.postcss.runtime~!!';

	return {
		name: 'freshie/postcss',

		resolveId(id) {
			return id === IDENT ? RUNTIME : null;
		},

		load(id) {
			if (!/\.(css|s[ac]ss|less|styl(us)?)$/.test(id)) return null;
			return existsSync(id) && read(id, 'utf8') || null;
		},

		async transform(source, id) {
			let css, file, tmp, map;
			if (/\.css$/.test(id)) {
				css = source;
				file = id;
			} else if (/\.styl(us)?$/.test(id)) {
				tmp = await stylus(id, source, toMap, rest.stylus);
				file = id.replace(/\.styl(us)?$/, '.css');
				css=tmp.css; map=tmp.map;
			} else if (/\.less$/.test(id)) {
				tmp = await less(id, source, toMap, rest.less);
				file = id.replace(/\.less$/, '.css');
				css=tmp.css; map=tmp.map;
			} else if (/\.s[ac]ss$/.test(id)) {
				tmp = await sass(id, source, toMap, rest.sass);
				file = id.replace(/\.s[ac]ss$/, '.css');
				css=tmp.css; map=tmp.map;
			} else {
				return null;
			}

			const toWrite = (file, data) => {
				this.emitFile({
					type: 'asset',
					fileName: file,
					source: data,
				});
			};

			const copy = [
				...plugins,
				require('./assets')({
					filters: assets,
					write(input, output) {
						let content = readFileSync(input);
						return toWrite(output, content);
					}
				}),
			].filter(Boolean);

			let Manifest = {};
			if (rest.modules) {
				copy.push(
					require('postcss-modules')({
						...Object(rest.modules),
						getJSON(file, mapping) {
							// TODO: config.modules.getJSON proxy
							Manifest = mapping;
						}
					})
				);
			}

			if (sourcemap && map) {
				map = { ...sourcemap, prev: map };
			} else if (!sourcemap) {
				map = false;
			}

			const output = await postcss(copy).process(css, {
				...rest, map, from: file,
			});

			if (toExtract) {
				file = toExtract(file);
			}

			// TODO: handle external sourcemap: `if (sourcemap && output.map)`
			// NOTE: `sourcemap.inline` already handled
			// console.log('FINAL OUTPUT', output.map);

			const content = (FILES.get(file) || '') + output.css;
			FILES.set(file, content); // full asset source

			let loader = '';

			if (!server) {
				const ref = REFS.get(file) || this.emitFile({
					type: 'asset',
					// sets `source` later
					name: basename(file),
				});

				REFS.set(file, ref);

				loader += `
					import { link } from "${IDENT}";
					link(import.meta.ROLLUP_FILE_URL_${ref});
				`;
			}

			for (let key in Manifest) {
				loader += `\nexport const ${key} = ${JSON.stringify(Manifest[key])};`;
			}

			return {
				code: loader.replace(/^\s+/gm, ''),
				// moduleSideEffects: true,
			};
		},

		renderStart() {
			if (server) return;
			for (let [file, ref] of REFS) {
				let content = FILES.get(file);
				this.setAssetSource(ref, content);
				FILES.delete(file); REFS.delete(file);
			}
		}
	};
}
