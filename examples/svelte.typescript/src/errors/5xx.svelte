<script context="module" lang="ts">
	import type { Preload } from 'freshie';

	export const preload: Preload = (req, context) => ({
		status: context.status
	});
</script>

<script>
	export let status = 400;
</script>

<h1>Error: {status}</h1>
<p>this is a custom 5xx error page</p>
