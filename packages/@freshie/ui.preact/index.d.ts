declare module '@freshie/ui.preact' {
	import type { ComponentChild, ComponentChildren } from 'preact';

	export type Props = Record<string, unknown>;

	export function render<T=Props>(Tags: ComponentChildren, props: T, target: HTMLElement): void;
	export function hydrate<T=Props>(Tags: ComponentChildren, props: T, target: HTMLElement): void;
	export function layout<T=Props>(Tags: ComponentChildren, props?: T): ComponentChild;

	export function ssr<T=Props>(Tags: ComponentChildren, props?: T): Record<'head'|'body', string>;
}
