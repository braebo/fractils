<script lang="ts">
	import { stringify, highlight, debrief } from '$lib'

	export let windows: any[]
</script>

<div class="positions">
	{#each windows as pos}
		{#await highlight(stringify(debrief(pos), 2)) then code}
			<pre><code class="language-json">{@html code}</code></pre>
		{/await}
	{/each}
</div>

<style lang="scss">
	.positions {
		position: absolute;
		top: 3.5rem;
		left: 1rem;
		width: fit-content;
		font-size: var(--font-xxs);
		background: var(--dark-a);
		padding: 0.5rem;
		border-radius: var(--radius);
	}
</style>
