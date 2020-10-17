<script context="module">
	import { get } from 'freshie/http';

	export async function preload(req) {
		let res = await get(`https://jsonplaceholder.typicode.com/posts/${req.params.id}`);
		return { article: res.data };
	}
</script>

<script>
	export let article;
</script>

<svelte:head>
	<title>{article.title}</title>
</svelte:head>

<h1>{article.title}</h1>

<div class="content">
	{@html article.body}
</div>
