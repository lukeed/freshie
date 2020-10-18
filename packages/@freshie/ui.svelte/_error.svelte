<script context="module">
	export function preload(req, context) {
		// console.log('_error.svelte got:', req, context);
		return { status: context.status }
	}
</script>

<script>
	export let status = 500;

	const messages = {
		'400': 'Bad Request',
		'404': 'Page Not Found',
		'429': 'Too Many Requests',
		'500': 'Unknown Error',
	}
</script>

<h1>Error ({status})</h1>
<p>{ messages[status] }</p>
