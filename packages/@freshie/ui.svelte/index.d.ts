declare module '@freshie/ui.svelte' {
	import type { Props } from 'freshie';
	import type { SvelteComponent } from 'svelte';

	export { Props };

	export function render(Tags: SvelteComponent[], props: Props, target: HTMLElement): void;
	export function hydrate(Tags: SvelteComponent[], props: Props, target: HTMLElement): void;
	export function layout(Tags: SvelteComponent[], props?: Props): SvelteComponent;

	export function ssr(Tags: SvelteComponent[], props?: Props): Record<'head'|'body', string>;
}
