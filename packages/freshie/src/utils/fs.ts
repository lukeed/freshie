import * as fs from 'fs';
import { promisify } from 'util';

export const write = promisify(fs.writeFile);
export const read = promisify(fs.readFile);
export const list = promisify(fs.readdir);

export const exists = fs.existsSync;

export function isDir(str: string): boolean {
	return exists(str) && fs.statSync(str).isDirectory();
}
