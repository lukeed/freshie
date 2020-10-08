import { join, resolve } from 'path';
import { isDir } from './fs';

// default = true
export const toBool = (val?: unknown) => val == null || !/(0|false)/.test(val as string);

export function normalize(src: Nullable<string>, argv: Partial<Argv.Options>, extra: Partial<Argv.Options> = {}) {
	Object.assign(argv, extra);
	const cwd = argv.cwd = resolve(argv.cwd || '.');

	argv.dest = join(cwd, argv.destDir = 'build');
	argv.src = join(cwd, argv.srcDir = src || 'src');

	// use root if "/src" does not exist
	argv.src = isDir(argv.src) ? argv.src : cwd;

	// default = true
	argv.ssr = toBool(argv.ssr);
	argv.minify = toBool(argv.minify);
}
