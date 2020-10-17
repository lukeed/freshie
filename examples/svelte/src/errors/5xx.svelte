<script context="module">
	export function preload(req, context) {
		return { status: context.status };
	}
</script>

<script>
	export let status = 400;
</script>

<h1>Error: {status}</h1>
<p>this is a custom 5xx error page</p>
