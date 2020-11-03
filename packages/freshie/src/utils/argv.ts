import { join, resolve } from 'path';
import { isDir } from './fs';

// default = true
export function toBool(val?: unknown, fallback = true) {
	return val == null ? fallback : !/(0|false)/.test(val as string);
}

export function normalize(src: Nullable<string>, argv: Partial<Argv.Options>, extra: Partial<Argv.Options> = {}) {
	Object.assign(argv, extra);
	const cwd = argv.cwd = resolve(argv.cwd || '.');

	argv.dest = join(cwd, argv.destDir = 'build');
	argv.src = join(cwd, argv.srcDir = src || 'src');

	// use root if "/src" does not exist
	argv.src = isDir(argv.src) ? argv.src : cwd;

	// default = false
	argv.isProd = !!argv.isProd;

	// default = true
	argv.ssr = toBool(argv.ssr, true);

	// default = (dev) false; (prod) true
	argv.minify = argv.isProd && toBool(argv.minify, true);

	// default = (dev) true; (prod) false
	argv.sourcemap = toBool(argv.sourcemap, !argv.isProd);
}
