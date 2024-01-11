<script lang="ts">
	import { resizable } from '../actions/resizable'
</script>

<div class="container flex center" use:resizable={{}}>
	<slot>
		<div>Resizable Default Slot Content</div>
	</slot>
</div>

<style lang="scss">
	.container {
		width: var(--width, 10rem);
		height: var(--height, 10rem);

		background: rgba(var(--bg-a-rgb), 0.8);
		backdrop-filter: blur(0.2rem);
		outline: 1px solid rgba(var(--bg-b-rgb), 0.5);
		border-radius: var(--radius);
		box-shadow:
			var(--shadow-lg),
			inset 0 0 10px rgba(var(--bg-b-rgb), 0.33);

		z-index: 9999;
	}
</style>
