import type { Router } from 'freshie/router';
import type { Props } from 'freshie';

export const router: Router;

declare namespace DOM {
	export type Render<T=any> = (Tags: T[], props: Props, target: HTMLElement) => void;
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
