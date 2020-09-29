declare namespace Rollup {
	type Bundle = import('rollup').RollupBuild;
	type Config = Partial<import('rollup').RollupOptions> & { output: import('rollup').OutputOptions };
	type Resolve = Partial<import('@rollup/plugin-node-resolve').RollupNodeResolveOptions> & { mainFields: string[] };
	type Options = Record<string, any> & { resolve: Resolve };
}
