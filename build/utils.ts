// @see https://github.com/lukeed/bundt/blob/master/index.js
// import rimports from 'rewrite-imports';
import { dirname, normalize } from 'path';
import * as colors from 'kleur/colors';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';

const _ = ' ';
const UNITS = ['B ', 'kB', 'MB', 'GB'];
const lpad = (str: string, max: number) => _.repeat(max - str.length) + str;
const rpad = (str: string, max: number) => str + _.repeat(max - str.length);

const DI = (x: string) => colors.dim(colors.italic(x));
const TH = (x: string) => DBI(colors.underline(x));
const DBI = (x: string) => colors.bold(DI(x));

export type FileData = Record<'file'|'size'|'gzip', string>;

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export function inspect(file: string, buffer: Uint8Array): FileData {
	let gz = gzipSync(buffer).byteLength;
	return {
		file: file,
		gzip: size(gz),
		size: size(buffer.byteLength),
	};
}

function size(val=0) {
	if (val < 1e3) return `${val} ${UNITS[0]}`;
	let exp = Math.min(Math.floor(Math.log10(val) / 3), UNITS.length - 1) || 1;
	let out = (val / Math.pow(1e3, exp)).toPrecision(3);
	let idx = out.indexOf('.');
	if (idx === -1) {
		out += '.00';
	} else if (out.length - idx - 1 !== 2) {
		out = (out + '00').substring(0, idx + 3); // 2 + 1 for 0-based
	}
	return out + ' ' + UNITS[exp];
}

export function table(modname: string, pkgdir: string, files: FileData[]): void {
	let f=modname.length, s=8, g=6;
	let G1 = _+_, G2 = G1+G1, out='';

	files.sort((a, b) => a.file.localeCompare(b.file)).forEach(obj => {
		obj.file = normalize(
			obj.file.replace(pkgdir, '')
		);

		f = Math.max(f, obj.file.length);
		s = Math.max(s, obj.size.length);
		g = Math.max(g, obj.gzip.length);
	});

	f += 2; // underline extension

	out += G1 + TH(rpad(modname, f)) + G2 + TH(lpad('Filesize', s)) + G1 + DBI(lpad('(gzip)', g));

	files.forEach((obj, idx) => {
		if (idx && idx % 3 === 0) out += '\n';
		out += ('\n' + G1 + colors.white(rpad(obj.file, f)) + G2 + colors.cyan(lpad(obj.size, s)) + G1 + DI(lpad(obj.gzip, g)));
	});

	console.log('\n' + out + '\n');
}

/**
 * @see https://github.com/lukeed/bundt/blob/master/index.js#L131
 */
// export function rewrite(content: string): string {
// 	let footer = '';
// 	return rimports(content)
// 		.replace(/(^|\s|;)export default/, '$1module.exports =')
// 		.replace(/(^|\s|;)export (const|(?:async )?function|class|let|var) (.+?)(?=(\(|\s|\=))/gi, (_, x, type, name) => {
// 			footer += `\nexports.${name} = ${name};`;
// 			return `${x}${type} ${name}`;
// 		})
// 		.replace(/(^|\s|\n|;?)export \{([\s\S]*?)\};?([\n\s]*?|$)/g, (_, x, names) => {
// 			(names as string).split(',').forEach(name => {
// 				let [src, dest] = name.trim().split(/\s+as\s+/);
// 				footer += `\nexports.${dest || src} = ${src};`;
// 			});
// 			return x;
// 		})
// 		.concat(
// 			footer
// 		);
// }
