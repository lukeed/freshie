import { existsSync, statSync } from 'fs';
import { promises as fs } from 'fs';

export async function remove(input: string): Promise<void> {
	return fs.rm(input, { recursive: true, force: true });
}

export const list = fs.readdir;
export const exists = existsSync;
export const write = fs.writeFile;
export const read = fs.readFile;

export function isDir(str: string): boolean {
	return exists(str) && statSync(str).isDirectory();
}

export function match(arr: string[], pattern: RegExp): string | void {
	return arr.find(x => pattern.test(x));
}
