<script context="module" lang="ts">
	import { get } from 'freshie/http';
	import type { Preload } from 'freshie';

	export const preload: Preload = async (req, context) => {
		let res = await get('https://jsonplaceholder.typicode.com/posts');
		return { articles: res.data };
	}
</script>

<script lang="ts">
	export let articles: any[];
</script>

<svelte:head>
	<title>Articles</title>
</svelte:head>

<h1>All Articles</h1>

<div class="content">
	<ul>
		{#each articles as article (article.id)}
		<li><a href="/blog/{article.id}">{article.title}</a></li>
		{:else}
		<li>NO POSTS</li>
		{/each}
	</ul>
</div>
