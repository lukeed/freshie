declare global {
	type TODO = any;
	type Nullable<T> = T | null;
	type Dict<T> = Record<string, T>;
}

export namespace Argv {
	interface Options {
		cwd: string;
		minify: boolean;
		sourcemap: boolean;
		ssr: boolean;
		//
		src: string;
		dest: string;
		srcDir: string;
		destDir: string;
		//
		isProd: boolean;
	}
}

export namespace Build {
	interface Route {
		file: string;
		pattern: string;
		type: number;
		layout: string | null;
		wild: string | null;
	}

	interface Error {
		key: string;
		file: string;
		layout: string | null;
	}

	interface Entries {
		dom: string;
		html: string;
		ssr: string;
	}

	type Context = import('freshie').Config.Context & {
		cwd: string;
		sourcemap: boolean;
		src: string;
	}
}

import type * as R from 'rollup';

export namespace Rollup {
	type Plugin = R.Plugin;
	type Asset = R.OutputAsset;
	type Chunk = R.OutputChunk;
	type Bundle = R.RollupBuild;
	type Output = R.RollupOutput;
	type Watcher = R.RollupWatcher;
	type Config = Partial<R.RollupOptions> & { output: R.OutputOptions };
	// type Resolve = Partial<import('@rollup/plugin-node-resolve').RollupNodeResolveOptions> & { mainFields: string[] };
	// type Options = Record<string, any> & { resolve: Resolve };
}
