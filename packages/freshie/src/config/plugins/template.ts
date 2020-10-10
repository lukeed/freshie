import * as fs from '../../utils/fs';
import * as assert from '../../utils/assert';

export function Template(file: string): Rollup.Plugin {
	let entry: string;
	const ident = '!!~html~!!';

	return {
		name: 'plugins/template',
		buildStart() {
			assert.exists(file, 'Cannot find pre-built "index.html" template!');
		},
		resolveId(id) {
			return id === ident ? ident : null;
		},
		async load(id) {
			if (id !== ident) return null;
			let html = await fs.read(file, 'utf8');
			return `export const HTML = \`${html}\`;`;
		}
	}
}
