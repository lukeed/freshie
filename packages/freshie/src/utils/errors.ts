import { join, parse } from 'path';
import { totalist } from 'totalist';
import escalade from 'escalade';
import { exists } from './fs';

import type { Build } from '../internal';
import type { Config } from 'freshie';

// UNUSED - inlined directly in runtimes
export function match(code: number, dict: Dict<unknown>) {
	const key = String(code);
	return dict[key] || dict[key.charAt(0) + 'xx'] || dict['xxx'];
}

/**
 * Find all "errors/*" templates
 * @param src The "/src" directory path
 * @param options The "templates" config options
 */
export async function collect(src: string, options: Config.Options['templates']): Promise<Build.Error[]> {
	const ERRORS: Build.Error[] = [];
	const { test, layout, errors } = options;

	const dir = join(src, errors);
	if (!exists(dir)) return ERRORS;

	let hasXXX = false, standin: Build.Error | void;
	const isLayout = (str: string) => layout.test(str) && test.test(str);

	await totalist(dir, async (base, absolute) => {
		if (/^[._]/.test(base) || !test.test(base)) return;
		const { name } = parse(base);
		if (name === 'xxx') {
			hasXXX = true;
			if (standin) {
				standin.file = absolute;
				return;
			}
		}

		const info: Build.Error = {
			file: absolute,
			layout: null,
			key: name,
		};

		if (name === 'index') {
			if (hasXXX) return;
			info.key = 'xxx';
			standin = info;
		}

		// scale upwards to find closest layout file
		await escalade(absolute, (dirname, contents) => {
			let tmp = contents.find(isLayout);
			if (tmp) return info.layout = join(dirname, tmp);
		});

		ERRORS.push(info);
	});

	return ERRORS;
}
