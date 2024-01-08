<script lang="ts">
	import { resize } from '$lib/utils/resizable'
	import THEME_A from './themes/theme-a.json'
	import { Themer } from './Themer'
	import { onMount } from 'svelte'

	const themer = new Themer({
		theme: 'theme-default',
		autoInit: true,
	})

	let key = false
	const toggleKey = () => (key = !key)

	onMount(toggleKey)
</script>

{#if themer}
	{#key themer && key}
		<div class="container" use:resize={{ persistent: true }}>
			<div class="themer">
				<div class="kv mode">
					<div class="k">Mode</div>
					<options class="v" on:change={toggleKey}>
						<select bind:value={themer.mode} on:change={toggleKey}>
							<option value="dark">dark</option>
							<option value="light">light</option>
							<option value="system">system</option>
						</select>
					</options>
				</div>

				<div class="kv theme">
					<div class="k">Theme</div>
					<options class="v">
						<select bind:value={themer.theme} on:change={toggleKey}>
							{#each themer.themes as value}
								<option value={value.name}>{value.name}</option>
							{/each}
						</select>
					</options>
				</div>

				<div class="kv toJSON">
					<div class="k">console.log</div>
					<div class="v">
						<button on:click={() => console.log(themer.toJSON())}>toJSON</button>
					</div>
				</div>

				<div class="kv theme-a">
					<div class="v">
						<button on:click={() => themer.addTheme(THEME_A)}>add theme-a</button>
					</div>
				</div>

				<div class="kv clear">
					<div class="v">
						<button on:click={() => themer.clear()}>clear</button>
					</div>
				</div>
			</div>
		</div>
	{/key}
{/if}

<style lang="scss">
	.container {
		// outline: 1px solid pink;
		position: fixed;
		top: 0;
		right: 0;

		padding: 1rem;
		margin: 2rem;

		border-radius: var(--radius-lg);
		background: rgba(var(--bg-a-rgb), 0.75);
		backdrop-filter: blur(0.2rem);

		overflow: hidden;
		z-index: 9999;
	}

	.themer {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;

		// min-width: 20rem;
		// min-height: 20rem;
		// background: rgba(10, 10, 20, 1);

		// transition: 0.2s;

		div {
			font-size: 1rem;
			color: var(--fg-c);

			padding: 0.5rem;
		}
	}

	.kv {
		display: flex;
		align-items: center;
		// justify-content: center;
		gap: 0.5rem;

		font-size: 1rem;
		color: var(--fg-c);
		outline: 1px solid var(--bg-b);
		border-radius: var(--radius);

		padding: 0.5rem;

		width: 100%;

		.k {
			display: flex;
			width: 8rem;
			font-weight: 600;
			font-family: var(--font-b);
		}

		.v {
			display: flex;
			font-family: var(--font-mono);
			width: 100%;

			select {
				all: unset;
				cursor: pointer;

				width: 100%;
				margin: auto;
				padding: 0.2rem 0.5rem 0.23rem 0.5rem;
				text-align: center;

				color: var(--brand-a);
				background: var(--bg-b);
				border-radius: var(--radius-sm);
				border: 1px solid var(--bg-c);

				font-weight: 300;
				transition:
					border-color 0.15s,
					font-weight 0.6s;

				&:hover {
					border-color: rgba(var(--brand-a-rgb), 0.33);

					font-weight: 500;
				}
			}

			button {
				all: unset;
				cursor: pointer;

				width: 100%;
				margin: auto;
				padding: 0.2rem 0.5rem 0.23rem 0.5rem;
				text-align: center;

				color: var(--brand-a);
				background: var(--bg-b);
				border-radius: var(--radius-sm);
				border: 1px solid var(--bg-c);

				font-weight: 300;
				transition:
					border-color 0.15s,
					font-weight 0.6s;

				&:hover {
					border-color: rgba(var(--brand-a-rgb), 0.33);

					font-weight: 500;
				}
			}
		}
	}
</style>
