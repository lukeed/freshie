// NOTE: lukeed/bundt fork
const kleur = require('kleur');
const { join } = require('path');
const { gzipSync } = require('zlib');
const { builtinModules } = require('module');
const { rollup } = require('rollup');
const scale = require('escalade');

const GUTTER = '    '; // 4
const UNITS = ['B ', 'kB', 'MB', 'GB'];
const lpad = (str, max, fmt) => fmt(' '.repeat(max - str.length) + str);
const rpad = (str, max, fmt) => fmt(str + ' '.repeat(max - str.length));
const COL1 = kleur.dim().bold().italic().underline;
const COL2 = kleur.dim().bold().italic;
const PKG = 'package.json';

function size(val=0) {
	if (val < 1e3) return `${val} ${UNITS[0]}`;
	let exp = Math.min(Math.floor(Math.log10(val) / 3), UNITS.length - 1) || 1;
	let out = (val / Math.pow(1e3, exp)).toPrecision(3);
	let idx = out.indexOf('.');
	if (idx === -1) out += '.00';
	else if (out.length - idx - 1 !== 2) {
		out = (out + '00').substring(0, idx + 3); // 2 + 1 for 0-based
	}
	return out + ' ' + UNITS[exp];
}

function table(mode, arr) {
	let label = `Package: ${mode}`;
	let f=label.length, s=8, g=6, out='';

	if (arr.length === 1) {
		f = Math.max(f, arr[0].file.length);
		g = Math.max(g, arr[0].gzip.length);
		s = Math.max(s, arr[0].size.length);
	} else {
		arr.sort((a, b) => {
			f = Math.max(f, a.file.length, b.file.length);
			g = Math.max(g, a.gzip.length, b.gzip.length);
			s = Math.max(s, a.size.length, b.size.length);
			return a.file.length - b.file.length;
		});
	}

	f += 4; // spacing

	out += rpad(label, f, COL1) + GUTTER + lpad('Filesize', s, COL1) + '  ' + lpad('(gzip)', g, COL2) + '\n';

	arr.forEach(obj => {
		out += rpad(obj.file, f, kleur.white) + GUTTER + lpad(obj.size, s, kleur.cyan) + '  ' + lpad(obj.gzip, g, kleur.dim().italic) + '\n';
	});

	console.log('\n' + out);
}

exports.build = async function (name, opts = {}) {
	try {
		const FILES = []; // outputs
		const { input, format, externals=[], plugins=[], ...rest } = opts;
		const external = [...builtinModules, ...externals];
		const pkgDir = join('packages', name);

		for (let key in format) {
			format[key] = join(pkgDir, format[key]);
		}

		// @ts-ignore - bad commonjs definition
		const file = await scale(input, (dir, files) => {
			return files.includes(PKG) && join(dir, PKG);
		});

		const pkg = file && require(file);

		if (pkg) external.push(
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.peerDependencies || {}),
			...Object.keys(pkg.optionalDependencies || {}),
		);

		const bundle = await rollup({ input, plugins, external });

		await Promise.all(
			Object.keys(format).map(key => {
				return bundle.write({
					// @ts-ignore
					format: key,
					strict: false,
					esModule: false,
					file: format[key],
					...rest,
				}).then(result => {
					let { code } = result.output[0];
					FILES.push({
						file: format[key].replace(/^(\.[\\\/])?/, ''),
						gzip: size(gzipSync(code).length),
						size: size(code.length),
					});
				});
			})
		);

		table(name, FILES);
	} catch (err) {
		let msg = (err.message || err || 'Unknown error').replace(/(\r?\n)/g, '$1      ');
		console.error(kleur.red().bold('[BUILD] ') + msg);
		process.exit(1);
	}
}
