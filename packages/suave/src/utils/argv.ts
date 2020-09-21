import { join, resolve } from 'path';
import * as config from './config';
import * as utils from './index';

export function normalize(src: Nullable<string>, opts: Partial<Argv.Options>) {
	const cwd = opts.cwd = resolve(opts.cwd || '.');

	opts.dest = join(cwd, opts.destDir = 'build');
	opts.src = join(cwd, opts.srcDir = src || 'src');

	// use root if "/src" does not exist
	opts.src = utils.isDir(opts.src) ? opts.src : cwd;

	return config.load(opts as Argv.Options);
}
