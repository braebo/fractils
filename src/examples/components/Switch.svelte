<!-- Switch editor wip -- pulled from DHM -->

<script lang="ts">
	import Switch from '$lib/components/Switch.svelte';
	import { onMount } from 'svelte';
	import { theme } from '$lib';

	onMount(() => {
		document.querySelector('.hero-image')?.remove();

		const interval = setInterval(() => {
			checked = !checked;
		}, 1000);

		return () => clearInterval(interval);
	});

	let checked = $theme !== 'dark';

	let width = 3.25;
	let padding = 0.25;
	let thumbSize = 1.1;
	let ratio = 1;
	let thumbRadius = 1;
	let sliderRadius = 1.25;

	$: dark = $theme === 'dark';
</script>

<div class="page">
	<div class="br-lg" />
	<div class="row">
		<div class="section">
			<div class="title">Slider</div>

			<div class="content">
				<div class="col">
					<div class="kv">
						<span class="k">width</span>
						<span class="v">
							{width.toFixed(2)}rem
						</span>
					</div>
					<input type="range" bind:value={width} min="2.5" max="10" step="0.1" />
				</div>
				<div class="col">
					<div class="kv">
						<span class="k">padding</span>
						<span class="v">
							{padding.toFixed(2)}rem
						</span>
					</div>
					<input type="range" bind:value={padding} min="0.1" max="2" step="0.01" />
				</div>

				<div class="col">
					<div class="kv">
						<span class="k">radius</span>
						<span class="v">
							{sliderRadius.toFixed(2)}rem
						</span>
					</div>
					<input type="range" bind:value={sliderRadius} min="0.1" max="2" step="0.01" />
				</div>
			</div>
		</div>

		<div class="section">
			<div class="title">Thumb</div>
			<div class="content">
				<div class="col">
					<div class="kv">
						<span class="k">thumb size</span>
						<span class="v">
							{thumbSize.toFixed(2)}rem
						</span>
					</div>
					<input type="range" bind:value={thumbSize} min="1.25" max="3" step="0.1" />
				</div>

				<div class="col">
					<div class="kv">
						<span class="k">thumb ratio</span>
						<span class="v">
							{ratio.toFixed(2)}%
						</span>
					</div>
					<input type="range" bind:value={ratio} min="0.01" max="2" step="0.01" />
				</div>

				<div class="col">
					<div class="kv">
						<span class="k">thumbRadius</span>
						<span class="v">
							{thumbRadius.toFixed(2)}rem
						</span>
					</div>
					<input type="range" bind:value={thumbRadius} min="0.1" max="2" step="0.1" />
				</div>
			</div>
		</div>
	</div>
	<div class="br-md" />
	<center
		style="
	--switch-padding: {padding.toFixed(2)}rem;
	--switch-width: {width}rem;
	--switch-thumb-size: {thumbSize}rem;
	--switch-thumb-ratio: {ratio};
	--switch-thumb-radius: {thumbRadius}rem;
	--switch-slider-radius: {sliderRadius}rem;
"
	>
		<Switch />
		<div class="br-sm" />

		<Switch {checked}>
			<span slot="slider-content-on">🌞</span>
			<span slot="slider-content-off">🌙</span>
		</Switch>
		<div class="br-sm" />

		<span style:font-size="0.8rem">
			<Switch {checked} --switch-accent="var(--theme-b)">
				<span slot="thumb-content-on">🌞</span>
				<span slot="thumb-content-off">🌙</span>
			</Switch>
		</span>
		<div class="br-sm" />

		<Switch checked={true} />
	</center>
</div>

<style lang="scss">
	.page {
		position: absolute;
		top: 0;
		width: 100vw;
		height: 100vh;
		overflow: auto;
		background: black;
		transform-origin: center;
		// prettier-ignore
	}
	@media (min-width: 1000px) {
		.page {
			transform: scale(1.5) translate(0, 15%);
		}
	}

	center {
		position: relative;
		z-index: 1;
	}

	.row {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		gap: 2rem;

		width: fit-content;
		max-width: min(500px, 50vw);
		margin: auto;

		color: var(--fg-a);

		font-family: var(--font-c);

		z-index: 1;
	}

	.section {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		width: 100%;

		.title {
			font-size: 1.5rem;
			font-weight: 600;
			text-align: center;

			color: var(--bg-d);
		}

		.content {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
		}
	}

	.col {
		position: relative;
		backdrop-filter: blur(0.25rem);
		padding: 0.5rem;
		gap: 0.25rem;

		background: var(--bg-a);
		border-radius: var(--radius);
		box-shadow: 0 3px 5px #0005, 0 1px 2px #0008, 0 -1px 2px #0005 inset,
			0 1px 0.25rem rgba(var(--bg-b-rgb), 1) inset;
	}

	input {
		width: 90%;
		accent-color: var(--bg-d);
		// transition: 0.15s;
		&:hover {
			accent-color: #777;
		}
	}
	input[type='range']:focus {
		outline: 1px solid var(--bg-c);
		border-radius: 1rem;
	}

	.col input[type='range']::-webkit-slider-runnable-track {
		height: 10px;
		cursor: pointer;
		box-shadow: 0 1px 2px #5558;
		background: var(--bg-b);
		border-radius: 5px;
		z-index: 1;
		&:hover {
			box-shadow: 0 1px 2px #5558;
		}
	}

	input::-webkit-slider-thumb {
		appearance: none;
		-webkit-appearance: none;
		box-shadow: 0 1px 2px #0007, 0 4px 8px #0003;
		// border: 1px solid #aaa;
		// max-height: 7px;
		margin-top: -0.175rem;
		width: 15px;
		border-radius: 1rem;
		cursor: pointer;

		z-index: 2;
	}

	.col {
		font-family: monospace;
	}

	.kv {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		font-size: 0.8rem;

		gap: 2rem;

		padding-left: 0.5rem;
	}

	.k {
		color: var(--fg-c);
	}

	.v {
		color: var(--fg-a);
	}
</style>
