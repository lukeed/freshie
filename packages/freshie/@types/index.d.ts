type Nullable<T> = T | null;
type Arrayable<T> = T[] | T;
type Promisable<T> = Promise<T> | T;

type Dict<T> = Record<string, T>;
type Subset<T, V=any> = T & Dict<V>;

type TODO = any;

// ---

declare namespace Argv {
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

declare namespace Config {
	type Rollup = Rollup.Config;

	interface Options extends Dict<any> {
		publicPath: string;

		alias: Subset<{
			entries: Subset<{
				'~routes': string;
				'~components': string;
				'~assets': string;
				'~utils': string;
				'~tags': string;
			}, string>;
		}>;

		ssr: {
			type: 'node' | 'worker' | 'lambda';
			entry: Nullable<string>; // default entry
			// bucket?: string;
		};

		templates: {
			test: RegExp;
			routes: string;
			errors: string;
			layout: RegExp;
		};

		copy: string[];

		assets: {
			dir: string;
			test: RegExp;
		};

		replace: Subset<{
			'__DEV__': string;
			'__BROWSER__': string;
			'process.browser': string;
			'process.env.NODE_ENV': string;
		}, string>;

		resolve: Subset<{
			extensions: string[];
			mainFields: string[];
		}>;

		commonjs: Subset<{
			extensions: string[];
		}>;

		json: Subset<{
			preferConst: boolean;
			namedExports: boolean;
			indent: string;
		}>;

		terser: import('terser').MinifyOptions;
	}

	interface Context {
		cwd: string;
		ssr: boolean;
		isProd: boolean;
		sourcemap: boolean;
		minify: boolean;
		src: string;
	}

	interface Group {
		client: Rollup;
		options: Options;
		server: Rollup | void;
	}

	namespace Customize {
		type Rollup = (config: Config.Rollup, context: Config.Context, options: Config.Options) => void;
		type Options = {
			[K in keyof Config.Options]: (config: Config.Options[K], context: Config.Context) => void;
		};
	}
}

declare namespace Build {
	interface Route {
		file: string;
		pattern: string;
		type: number;
		layout: Nullable<string>;
		wild: Nullable<string>;
	}

	interface Error {
		key: string;
		file: string;
		layout: Nullable<string>;
	}

	interface Entries {
		dom: string;
		html: string;
		ssr: string;
	}
}

declare namespace Runtime {
	type Params = Dict<string>;

	type Headers = Dict<string | string[]>;

	interface Request {
		params: Params;
		pathname: string;
		search: string;
		query: Dict<string>;
	}

	interface Context {
		status: number;
		headers: Headers;
		redirect?: string;
		error?: Error;
	}

	interface Options {
		basePath: string;
		render<C extends Function, P extends Dict<any>>(Component: C, props: P): void;
	}
}
