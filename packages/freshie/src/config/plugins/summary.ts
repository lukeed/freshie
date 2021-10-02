/**
 * @see https://github.com/lukeed/bundt
 */

import colors from 'kleur';
import { gzipSync } from 'zlib';
import * as pretty from '../../utils/pretty';
import * as log from '../../utils/log';

import type { Rollup } from '../../internal';

type Options = Record<'brotli'|'isDOM', boolean>;
type Padding = (str: string, max: number) => string;
type Stats = Record<'file'|'size'|'gzip', string> & { notice: number };

const gut2 = ' '.repeat(2);
const gut4 = ' '.repeat(4);
const th = colors.dim().bold().italic().underline;
const rpad: Padding = (str, max) => str.padEnd(max);
const lpad: Padding = (str, max) => str.padStart(max);
const levels = [colors.cyan, colors.yellow, colors.red]; // sizes|notices

let max = { file:0, size:0, gzip:0 };

// TODO: brotli
export function Summary(opts: Partial<Options> = {}): Rollup.Plugin {
	const { isDOM } = opts;

	let start: number;
	let name = colors.bold().underline().green(isDOM ? 'DOM' : 'SSR');

	return {
		name: 'plugins/summary',

		// options(config) {
		// 	config.perf = true;
		// 	return config;
		// },

		buildStart() {
			start = Date.now();
		},

		generateBundle(_config, bundle) {
			let tmp: Stats, out = `Compiled ${name} output in ${pretty.time(Date.now() - start)}`;

			let assets = Object.keys(bundle).sort().map(file => {
				let code = (bundle[file] as Rollup.Chunk).code || (bundle[file] as Rollup.Asset).source;
				let len = pretty.size(code.length);
				let gz = gzipSync(code).length;

				let notice = gz >= 2e5 ? 2 : gz >= 1e5 ? 1 : 0; //~> 200kb vs 100kb
				tmp = { file, size: len, gzip: pretty.size(gz), notice };

				max.file = Math.max(max.file, file.length);
				max.gzip = Math.max(max.gzip, tmp.gzip.length);
				max.size = Math.max(max.size, len.length);

				return tmp;
			});

			if (isDOM) {
				// gutters
				max.file += 4;
				max.size += 4;
			}

			// table headers
			out += ('\n\n' + th(rpad('Filename', max.file)) + gut4 + th(lpad('Filesize', max.size)) + gut2 + colors.dim().bold().italic(lpad('(gzip)', max.gzip)));

			assets.forEach(obj => {
				let fn = levels[obj.notice];
				let gz = colors.italic((obj.notice ? fn : colors.dim)(gut2 + lpad(obj.gzip, max.gzip)));
				out += ('\n' + colors.white(rpad(obj.file, max.file)) + gut4 + fn(lpad(obj.size, max.size)) + gz);
			});

			log.success(out + '\n');
		}
	}
}
