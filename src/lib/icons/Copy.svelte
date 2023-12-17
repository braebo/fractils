<svelte:options namespace="svg" />

<script>
	export let active = false
</script>

<svg
	class="icon copy"
	class:active
	xmlns="http://www.w3.org/2000/svg"
	width="100%"
	height="100%"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	<path class="back" d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
	<rect class="front" x="9" y="9" width="13" height="13" rx="2" ry="2" />

	<path class="check" stroke-width="3" d="M17 9l-7 7-4-4" />
</svg>

<style lang="scss">
	$primary: var(--primary, currentColor);
	$secondary: var(--secondary, var(--bg-a));

	rect,
	path {
		transform-origin: 50% 50%;

		transition: 0.25s;
		transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.active path.back {
		transform-origin: 50% 50%;
		transform: translate(15%, 15%);
		/* roundess */
		rx: 10;
		ry: 10;
	}

	rect {
		stroke: currentColor;
		fill: $secondary;
	}

	rect.front {
		// fill: $secondary;
		fill: inherit;
	}

	.active rect.front {
		transform: scale(1.5) translate(-15%, -15%);
		/* roundess */
		rx: 10;
		ry: 10;

		// light green check
		fill: #1abc9c;
		stroke: #1abc9c;
	}

	path.check {
		opacity: 0;
		transform: scale(0);
		transition-delay: 0s;
		stroke: $secondary;
	}

	.active path.check {
		opacity: 1;
		transform: scale(1);
		transition-delay: 0.1s;
	}
</style>
