<template>
	<div>
		<h1>{{ article.title }}</h1>
		<div class="content" v-html="article.body" />
	</div>
</template>

<script>
	export async function preload(req) {
		let res = await fetch(`https://jsonplaceholder.typicode.com/posts/${req.params.id}`);
		let article = await res.json();
		console.log('PRELOADED', article);
		return { article };
	}

	export default {
		props: ['article'],
		data() {
			return {
				article: {}
			};
		}
	}

	// <svelte:head>
	// 	<title>{article.title}</title>
	// </svelte:head>
</script>
