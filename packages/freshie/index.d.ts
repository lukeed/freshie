declare module 'freshie' {
	type Nullable<T> = T | null;
	type Arrayable<T> = T[] | T;
	type Promisable<T> = Promise<T> | T;

	type Dict<T> = Record<string, T>;
	type Subset<T, V=any> = T & Dict<V>;

	// ---

	export namespace Config {
		// type Rollup = Partial<import('rollup').RollupOptions> & {
		// 	output: import('rollup').OutputOptions
		// };

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
				conditions: string[];
				mainFields: string[];
			}>;

			// commonjs: Subset<{
			// 	extensions: string[];
			// }>;

			// json: Subset<{
			// 	preferConst: boolean;
			// 	namedExports: boolean;
			// 	indent: string;
			// }>;

			terser: Subset<{
				mangle: boolean;
				compress: boolean;
				output: Dict<any>;
			}>;
		}

		interface Context {
			ssr: boolean;
			isProd: boolean;
			minify: boolean;
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

	export type Props = Dict<any>;
	export type Params = Dict<string>;
	export type Headers = Dict<string | string[]>;

	export interface Request {
		params: Params;
		pathname: string;
		search: string;
		query: Dict<string>;
	}

	export interface Context {
		status: number;
		headers: Headers;
		redirect?: string;
		error?: Error;
	}

	export type Preload<T=Props> = (req: Request, context: Context) => Promisable<T>;

	export interface Options {
		basePath: string;
		render<C extends Function, P extends Dict<any>>(Component: C, props: P): void;
	}
}
