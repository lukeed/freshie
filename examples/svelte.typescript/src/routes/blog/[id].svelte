<script context="module" lang="ts">
	import { get } from 'freshie/http';
	import type { Request } from 'freshie';

	export async function preload(req: Request) {
		let res = await get(`https://jsonplaceholder.typicode.com/posts/${req.params.id}`);
		return { article: res.data };
	}
</script>

<script lang="ts">
	export let article: Record<string, string>;
</script>

<svelte:head>
	<title>{article.title}</title>
</svelte:head>

<h1>{article.title}</h1>

<div class="content">
	{@html article.body}
</div>
