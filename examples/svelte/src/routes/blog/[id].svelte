<script context="module">
	// export async function preload(req) {
	// 	let res = await fetch(`https://jsonplaceholder.typicode.com/posts/${req.params.id}`);
	// 	let article = await res.json();
	// 	return { article };
	// }
	import { send } from 'httpie';
	export async function preload(req) {
		let res = await send('GET', `https://jsonplaceholder.typicode.com/posts/${req.params.id}`);
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
