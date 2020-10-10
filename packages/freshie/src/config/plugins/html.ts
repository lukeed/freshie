import * as fs from '../../utils/fs';

import type { HTMLElement } from 'node-html-parser';

function toPreload(href: string, type: 'script' | 'style' | 'image' | 'font'): string {
	return `<link rel="preload" href="${href}" as="${type}"/>`;
}

function parse(value: string): HTMLElement {
	return require('node-html-parser').parse(value);
}

function append(base: HTMLElement, content: string) {
	let node = parse(content);
	base.appendChild(node);
}

// TODO? add `nomodule` option
// TODO? expose `preload` option
interface Options {
	preload?: boolean;
	publicPath?: string;
	minify?: boolean;
}

// TODO: preload `routes` files?
// TODO: template via UI libary (`index.html.{ext}`)
export function HTML(template: string, opts: Options = {}): Rollup.Plugin {
	const { publicPath='/', preload=true, minify=true } = opts;

	return {
		name: 'plugins/html',
		// TODO(MAYBE): Check if HTML entry/input (hook: `options`)
		async generateBundle(config, bundle) {
			const { format } = config;
			const entryAssets: Set<string> = new Set;

			for (let key in bundle) {
				if (!/\.js$/.test(key)) continue;

				let tmp = bundle[key] as Rollup.Chunk;
				if (!tmp.isEntry) continue;

				entryAssets.add(key); // JS file
				tmp.imports.forEach(str => entryAssets.add(str));
				tmp.referencedFiles.forEach(str => entryAssets.add(str));
			}

			let document = parse(await fs.read(template, 'utf8'));

			// TODO? Throw error if empty
			if (entryAssets.size > 0) {
				const dochead = document.querySelector('head');
				const docbody = document.querySelector('body');

				for (let filename of entryAssets) {
					filename = publicPath + filename;

					if (/\.css$/.test(filename)) {
						if (preload) append(dochead, toPreload(filename, 'style'));
						append(dochead, `<link rel="stylesheet" href="${filename}"/>`);
					} else if (/\.m?js$/.test(filename)) {
						if (preload) append(dochead, toPreload(filename, 'script'));
						if (/esm?/.test(format)) {
							// TODO(future): "preload" => "modulepreload" *only* when better supported
							if (preload) append(dochead, `<link rel="modulepreload" href="${filename}"/>`);
							append(docbody, `<script type="module" src="${filename}"></script>`);
							append(docbody, `<script nomodule defer src="https://unpkg.com/dimport/nomodule" data-main="${filename}"></script>`);
						} else {
							append(docbody, `<script src="${filename}"></script>`);
						}
					}
				}
			}

			// TODO? use `html-minifier`, overkill?
			if (minify) document.removeWhitespace();

			this.emitFile({
				type: 'asset',
				fileName: 'index.html',
				source: document.toString(),
			});
		}
	}
}
