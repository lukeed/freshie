import { resolve } from 'path';
import { exists } from './fs';

export { collect as routes } from './routes';
export { collect as errors } from './errors';

export function load<T=unknown>(str: string, dir?: string): T | false {
	str = resolve(dir || '.', str);
	return exists(str) && require(str);
}

export function from(dir: string, id: string) {
	return require.resolve(id, { paths: [dir, __dirname] });
}
