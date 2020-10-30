const { basename } = require('path');
const { readFile, readFileSync } = require('fs');
const { promisify } = require('util');
const postcss = require('postcss');

const read = promisify(readFile);
let render_stylus, render_less, render_sass;

function load(name) {
	try { return require(name) }
	catch (e) { throw new Error(`\nPlease install the "${name}" package:\n  $ npm install --save-dev ${name}`) }
}

async function stylus(filename, sourcemap, options={}) {
	if (!render_stylus) render_stylus = load('stylus');

	options.filename = filename;
	let data = await read(filename, 'utf8');
	if (sourcemap) options.sourcemap={ comment: false };

	let ctx = render_stylus(data, options);

	return new Promise((res, rej) => {
		ctx.render((err, css) => {
			let map = sourcemap && ctx.sourcemap;
			return err ? rej(err) : res({ css, map });
		});
	});
}

async function sass(filename, sourcemap, options={}) {
	if (!render_sass) render_sass = load('node-sass').render;

	const indentedSyntax = /\.sass$/.test(filename);
	options.data = await read(filename, 'utf8');
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

async function less(filename, sourcemap, options={}) {
	if (!render_less) {
		render_less = load('less').render;
	}

	options.filename = filename;
	if (sourcemap) options.sourceMap={};
	let data = await read(filename, 'utf8');
	return render_less(data, options);
}

module.exports = function (opts={}) {
	const { plugins=[], assets, extract, sourcemap, ...rest } = opts;

	let toExtract = false;
	const FILES = new Map, REFS = new Map;
	if (typeof extract === 'string') toExtract = () => extract;
	else if (typeof extract === 'function') toExtract = extract;
	else if (extract === true) toExtract = () => 'bundle.css';

	const toMap = sourcemap != null && !!sourcemap;
	const RUNTIME = require.resolve('./runtime.js');

	return {
		name: 'freshie/postcss',

		async load(filename) {
			let source, tmp, map;
			if (/\.css$/.test(filename)) {
				source = await read(filename, 'utf8');
			} else if (/\.styl(us)?$/.test(filename)) {
				tmp = await stylus(filename, toMap, rest.stylus);
				filename = filename.replace(/\.styl(us)?$/, '.css');
				source=tmp.css; map=tmp.map;
			} else if (/\.less$/.test(filename)) {
				tmp = await less(filename, toMap, rest.less);
				filename = filename.replace(/\.less$/, '.css');
				source=tmp.css; map=tmp.map;
			} else if (/\.s[ac]ss$/.test(filename)) {
				tmp = await sass(filename, toMap, rest.sass);
				filename = filename.replace(/\.s[ac]ss$/, '.css');
				source=tmp.css; map=tmp.map;
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
			}

			const output = await postcss(copy).process(source, {
				...rest, map, from: filename,
			});

			if (toExtract) {
				filename = toExtract(filename);
			}

			// TODO: handle `if (sourcemap && output.map)` -> cache
			// NOTE: `sourcemap.inline` already handled
			// console.log('FINAL OUTPUT', output.map);

			const content = (FILES.get(filename) || '') + output.css;
			FILES.set(filename, content); // full asset source

			const ref = REFS.get(filename) || this.emitFile({
				type: 'asset',
				// sets `source` later
				name: basename(filename),
			});

			REFS.set(filename, ref);

			let loader = `
				import { link } from "${RUNTIME}";
				link(import.meta.ROLLUP_FILE_URL_${ref});
			`;

			// TODO: only do this part for ssr
			for (let key in Manifest) {
				loader += `\nexport const ${key} = ${JSON.stringify(Manifest[key])};`;
			}

			return {
				code: loader.replace(/^\s+/gm, ''),
				// moduleSideEffects: true,
			};
		},

		renderStart() {
			for (let [file, ref] of REFS) {
				let content = FILES.get(file);
				this.setAssetSource(ref, content);
				FILES.delete(file); REFS.delete(file);
			}
		}
	};
}
