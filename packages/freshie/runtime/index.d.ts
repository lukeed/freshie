import type Router from '../router';

export const router: Router;

declare namespace DOM {
	export type Render<T=unknown> = (Tag: T, props: Dict<any>, target: HTMLElement) => void;
}

export interface Options {
	/**
	 * The function that renders into the DOM container.
	 */
	render: DOM.Render;
	/**
	 * The hydration-specific code, if different than `options.render`.
	 * @default options.render
	 */
	hydrate?: DOM.Render;
	/**
	 * The HTML element to render into.
	 * @default document.body
	 */
	target?: HTMLElement;
	/**
	 * The application's base URL path.
	 * @default "/"
	 */
	base?: string;
}

export function start(options?: Options): void;
