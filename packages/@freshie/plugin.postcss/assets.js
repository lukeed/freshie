const { copyFileSync, existsSync, readFileSync, mkdirSync } = require('fs');
const { dirname, isAbsolute, parse, resolve } = require('path');
const { createHash } = require('crypto');
const postcss = require('postcss');

const RGX = /(url\(\s*['"]?)([^"')]+)(["']?\s*\))/g;

function toHash(filename, source) {
	const hmac = createHash('shake256', { outputLength: 16 });
	return hmac.update(source).digest('hex');
}

function noop() {
	//
}

// TODO: Rework for postcss 8.x
module.exports = postcss.plugin('freshie/postcss.assets', (opts={}) => {
	const { hash, filters, write, target } = opts;

	let toWrite;
	let mkdir = false;
	const Cache = new Map;

	if (write) {
		toWrite = write;
		mkdir = true;
	} else {
		// TODO: throw error no target?
		const dir = resolve('.', target);

		toWrite = (input, output) => {
			if (!mkdir) {
				mkdirSync(dir, { recursive: true });
				mkdir = true;
			}
			copyFileSync(input, resolve(dir, output));
		}
	}

	const toHasher = hash || toHash;
	const toFilter = typeof filters === 'function' ? filters : noop;

	return function (styles) {
		const file = styles.source.input.file;

		styles.walkDecls(decl => {
			if (!RGX.test(decl.value)) return;

			decl.value = decl.value.replace(RGX, (full, open, inner, close) => {
				let tmp = Cache.get(inner);
				if (tmp) return tmp;

				if (inner.startsWith('data:')) {
					return full; // url(data:...)
				}

				tmp = toFilter(inner, file, decl.value);

				if (tmp && RGX.test(tmp)) {
					Cache.set(inner, tmp);
					return tmp; // url(...)
				}

				tmp = tmp || inner;

				if (tmp.charAt(0) === '/') {
					tmp = open + tmp + close;
					Cache.set(inner, tmp);
					return tmp; // url(/...)
				}

				if (/^(https?:)?\/\//.test(tmp)) {
					tmp = open + tmp + close;
					Cache.set(inner, tmp);
					return tmp; // url(http://)
				}

				if (!isAbsolute(tmp)) {
					tmp = resolve(dirname(file), tmp);
				}

				let xyz = Cache.get(tmp);
				if (xyz) return xyz;

				if (!existsSync(tmp)) {
					throw new Error(`Asset file does not exist: "${tmp}"`);
				}

				let info = parse(tmp);
				let outfile = toHasher(tmp, readFileSync(tmp)) + info.ext;

				toWrite(tmp, outfile);

				tmp = open + '/' + outfile + close;
				Cache.set('/' + outfile, tmp);
				Cache.set(inner, tmp);
				return tmp; // url(/{hash}.{ext})
			});

			return decl;
		});
	}
});
