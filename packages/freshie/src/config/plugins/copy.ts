import { readFileSync } from 'fs';
import { totalist } from 'totalist';
import { exists } from '../../utils/fs';

export function Copy(dirs: string[] = []): Rollup.Plugin {
	return {
		name: 'plugins/copy',
		async generateBundle() {
			await Promise.all(
				dirs.map(dir => {
					return exists(dir) && totalist(dir, (rel, abs) => {
						this.emitFile({
							type: 'asset',
							source: readFileSync(abs),
							fileName: rel // no hash
						});
					})
				})
			);
		}
	};
}
