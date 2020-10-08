/**
 * @see https://github.com/lukeed/pwa/blob/master/packages/cli/lib/util/log.js
 */

import colors from 'kleur';
import type { Kleur } from 'kleur';

const PWA = colors.bold('[freshie]');
const SPACER = ' '.repeat(10); // "[freshie] "

export function print(color: keyof Kleur, msg: string) {
	console.log(colors[color](PWA), msg.includes('\n') ? msg.replace(/(\r?\n)/g, '$1' + SPACER) : msg);
}

export const log = print.bind(0, 'white');
export const info = print.bind(0, 'cyan');
export const success = print.bind(0, 'green');
export const warn = print.bind(0, 'yellow');
export const error = print.bind(0, 'red');

export function bail(msg: Error | string, code = 1): never {
	error(msg instanceof Error ? msg.stack : msg);
	process.exit(code);
}

export const $pkg = colors.magenta;
export const $dir = colors.bold().white;
