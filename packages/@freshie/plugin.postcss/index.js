const { basename } = require('path');
const { readFile, readFileSync } = require('fs');
const { promisify } = require('util');
const postcss = require('postcss');

const read = promisify(readFile);

function _stylus(filename, data, options={}) {
	// TODO: try/catch for module load
	const stylus = require('stylus');
	return new Promise((res, rej) => {
		// TODO: other options (sourcemap, import, etc)
		stylus.render(data, { ...options, filename }, (err, css) => {
			return err ? rej(err) : res(css);
		});
	});
}

module.exports = function (opts={}) {
	const { plugins=[], assets, extract, ...rest } = opts;

	let toExtract = false;
	const FILES = new Map, REFS = new Map;
	if (typeof extract === 'string') toExtract = () => extract;
	else if (typeof extract === 'function') toExtract = extract;
	else if (extract === true) toExtract = () => 'bundle.css';

	const RUNTIME = require.resolve('./runtime.js');

	return {
		name: 'freshie/postcss',

		async load(filename) {
			let source;
			if (/\.css$/.test(filename)) {
				source = await read(filename, 'utf8');
			} else if (/\.styl(us)?$/.test(filename)) {
				source = await _stylus(filename, await read(filename, 'utf8'), rest.stylus);
				filename = filename.replace(/\.styl(us)?$/, '.css');
			} else if (/\.less$/.test(filename)) {
				console.log('[TODO][styles] less support');
				filename = filename.replace(/\.less$/, '.css');
			} else if (/\.s[ac]ss$/.test(filename)) {
				console.log('[TODO][styles] scss support');
				filename = filename.replace(/\.s[ac]ss$/, '.css');
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

			const output = await postcss(copy).process(source, {
				...rest, from: filename,
			});

			if (toExtract) {
				filename = toExtract(filename);
			}

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
