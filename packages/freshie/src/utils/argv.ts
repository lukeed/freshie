import { join, resolve } from 'path';
import * as fs from './fs';

import type { Argv } from '../internal';

// default = true
export function toBool(val: unknown, fallback = true) {
	return val == null ? fallback : !/(0|false)/.test(val as string);
}

export function normalize(argv: Argv, isProd: boolean): asserts argv is Required<Argv> {
	const cwd = argv.cwd = resolve(argv.cwd || '.');
	argv.dest = join(cwd, argv.destDir='build');
	argv.src = join(cwd, argv.srcDir='src');

	argv.isProd = isProd;

	// use cwd if "/src" does not exist
	argv.src = fs.isDir(argv.src) ? argv.src : cwd;

	argv.ssr = toBool(argv.ssr, true);
	argv.minify = toBool(argv.minify, isProd);
	argv.sourcemap = toBool(argv.sourcemap, !isProd);
}
