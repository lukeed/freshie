<script context="module">
	export async function preload() {
		let res = await fetch(`https://jsonplaceholder.typicode.com/posts`);
		let articles = await res.json();
		return { articles };
	}
</script>

<script>
	export let articles;
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
