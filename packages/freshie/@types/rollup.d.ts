declare namespace Rollup {
	type Plugin = import('rollup').Plugin;
	type Asset = import('rollup').OutputAsset;
	type Chunk = import('rollup').OutputChunk;
	type Bundle = import('rollup').RollupBuild;
	type Output = import('rollup').RollupOutput;
	type Watcher = import('rollup').RollupWatcher;
	type Config = Partial<import('rollup').RollupOptions> & { output: import('rollup').OutputOptions };
	type Resolve = Partial<import('@rollup/plugin-node-resolve').RollupNodeResolveOptions> & { mainFields: string[] };
	type Options = Record<string, any> & { resolve: Resolve };
}
