<template>
	<div>
		<h1>Hello {{ name }}</h1>

		<a href="/blog">Blog</a>
	</div>
</template>

<script>
export default {
	data() {
		return {
			name: 'world'
		};
	}
}
</script>
