export function bail(msg: string, code = 1): never {
	console.error(msg); // TODO prefix + newline formatting
	process.exit(code);
}
