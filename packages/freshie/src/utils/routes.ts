import { join, parse, relative } from 'path';
import { totalist } from 'totalist';
import escalade from 'escalade';
import rsort from 'route-sort';
import { exists } from './fs';

// 0=static, 1=param, 2=wild
export const enum Pattern {
	Static,
	Param,
	Wild,
}

type Segment = [Pattern, string, string?];
export function to_segment(name: string): Segment {
	if (!name || name === 'index') return [Pattern.Static, ''];
	if (name[0] !== '[') return [Pattern.Static, name];

	name = name.slice(1, -1); // [slug] -> slug

	return (name.substring(0, 3) === '...')
		? [Pattern.Wild, '*', name.substring(3)]
		: [Pattern.Param, ':' + name];
}

export function to_pattern(rel: string) {
	let { dir, name } = parse(rel);
	let pattern='/', wild=null, type=0;
	let arr = [...dir.split(/[\\\/]+/g), name];

	for (let i=0, tmp: Segment; i < arr.length; i++) {
		if (!arr[i]) continue; // no dir
		tmp = to_segment(arr[i]);
		type = Math.max(type, tmp[0]);

		if (tmp[1]) {
			if (pattern.length > 1) pattern += '/';
			pattern += tmp[1];

			if (tmp[0] === Pattern.Wild) {
				wild = tmp[2];
				break;
			}
		}
	}

	return { pattern, wild, type };
}

/**
 * Find all Pages/Routes
 * @param src The "/src" directory path
 * @param options The "templates" config options
 */
export async function collect(src: string, options: Config.Options['templates']): Promise<Build.Route[]> {
	const routes = join(src, options.routes);
	if (!exists(routes)) return [];

	const { test, layout } = options;
	const PAGES = new Map<string, Build.Route>();

	const isLayout = (str: string) => layout.test(str) && test.test(str);

	await totalist(routes, async (base, absolute) => {
		if (/^[._]/.test(base) || !test.test(base)) return;
		const rel = relative(routes, absolute);

		const info: Build.Route = {
			...to_pattern(rel),
			file: absolute,
			layout: null,
		};

		// scale upwards to find closest layout file
		await escalade(absolute, (dirname, contents) => {
			let tmp = contents.find(isLayout);
			if (tmp) return info.layout = join(dirname, tmp);
		});

		// TODO: check existing/conflict
		PAGES.set(info.pattern, info);
	});

	const patterns = [...PAGES.keys()];
	return rsort(patterns).map(key => PAGES.get(key));
}
