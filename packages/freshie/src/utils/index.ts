import * as fs from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
// import { error } from './log';

export const write = promisify(fs.writeFile);
export const read = promisify(fs.readFile);
export const list = promisify(fs.readdir);

export { collect as routes } from './routes';

// export const assert = (mix: unknown, msg: string) => !!mix || error(msg);
// export const exists = (file: string, msg: string) =>  fs.existsSync(file) || error(msg);

export function load<T=unknown>(str: string, dir?: string): T | false {
	str = resolve(dir || '.', str);
	return fs.existsSync(str) && require(str);
}

export function from(dir: string, id: string) {
	return require.resolve(id, { paths: [dir, __dirname] });
}

export function isDir(str: string): boolean {
	return fs.existsSync(str) && fs.statSync(str).isDirectory();
}
