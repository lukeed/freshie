<template>
	<div>
		<h1>All Articles</h1>

		<div class="content">
			<ul>
				<li v-for="article in articles" :key="article.id">
					<a :href="`/blog/${ article.id }`">{{ article.title }}</a>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
	export async function preload() {
		let res = await fetch(`https://jsonplaceholder.typicode.com/posts`);
		let articles = await res.json();
		return { articles };
	}

	export default {
		props: ['articles'],
		data() {
			return {
				articles: []
			};
		}
	}

	// <svelte:head>
	// 	<title>Articles</title>
	// </svelte:head>
</script>
