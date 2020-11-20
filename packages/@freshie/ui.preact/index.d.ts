declare module '@freshie/ui.preact' {
	import type { Props } from 'freshie';
	import type { ComponentChild, ComponentChildren } from 'preact';

	export { Props };

	export function render(Tags: ComponentChildren, props: Props, target: HTMLElement): void;
	export function hydrate(Tags: ComponentChildren, props: Props, target: HTMLElement): void;
	export function layout(Tags: ComponentChildren, props?: Props): ComponentChild;

	export function ssr(Tags: ComponentChildren, props?: Props): Record<'head'|'body', string>;
}
