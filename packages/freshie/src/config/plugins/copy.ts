import { totalist } from 'totalist';
import { existsSync, readFileSync } from 'fs';

export function Copy(dirs: string[] = []): Rollup.Plugin {
	return {
		name: 'plugins/copy',
		async generateBundle() {
			await Promise.all(
				dirs.map(dir => {
					return existsSync(dir) && totalist(dir, (rel, abs) => {
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
