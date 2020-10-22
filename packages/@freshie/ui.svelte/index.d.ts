declare module '@freshie/ui.svelte' {
	import type { SvelteComponent } from 'svelte';

	export type Props = Record<string, unknown>;

	export function render<T=Props>(Tags: SvelteComponent[], props: T, target: HTMLElement): void;
	export function hydrate<T=Props>(Tags: SvelteComponent[], props: T, target: HTMLElement): void;
	export function layout<T=Props>(Tags: SvelteComponent[], props?: T): SvelteComponent;

	export function ssr<T=Props>(Tags: SvelteComponent[], props?: T): Record<'head'|'body', string>;
}
