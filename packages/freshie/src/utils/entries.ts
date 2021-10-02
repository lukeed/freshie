import { join } from 'path';
import * as fs from './fs';

import type { Build } from '../internal';
import type { Config } from 'freshie';

export async function collect(src: string, options: Config.Options): Promise<Build.Entries> {
	const entries = await fs.list(src).then(files => {
		// dom: index.{ext} || index.dom.{ext}
		let dom = fs.match(files, /index\.(dom\.)?[tjm]sx?$/);
		if (dom) dom = join(src, dom);

		// ssr: index.ssr.{ext}
		let ssr = fs.match(files, /index\.ssr\.[tjm]sx?$/);
		ssr = ssr ? join(src, ssr) : options.ssr.entry;

		// html: index.html || index.html.{ext}
		let html = fs.match(files, /index\.html(\.(svelte|vue|[tjm]sx?))?$/);
		if (html) html = join(src, html);

		return { dom, ssr, html };
	});

	if (!entries.dom) throw new Error('Missing "DOM" entry file!');
	if (!entries.html) throw new Error('Missing HTML template file!');

	return entries as Build.Entries;
}
