<script lang="ts">
	import { resizable } from '../actions/resizable'
	import { quadOut, quadIn } from 'svelte/easing'
	import autoAnimate from '@formkit/auto-animate'
	import { Themer } from '../themer/Themer'
	import { hover } from '../actions/hover'
	import { fly } from 'svelte/transition'
	// import theme1 from './themes/theme-1'

	export let themer = new Themer()

	const { theme, mode, themes } = themer

	let showDeleteText = Array.from({ length: themes.value.length }, () => false)
</script>

{#if themer}
	<div class="root" use:resizable={{ localStorageKey: 'fractils::themer::size' }}>
		<div class="themer">
			<div class="kv mode">
				<div class="k">Mode</div>
				<div class="v">
					<select bind:value={$mode}>
						<option value="dark">dark</option>
						<option value="light">light</option>
						<option value="system">system</option>
					</select>
				</div>
			</div>

			<div class="kv theme">
				<div class="k">Theme</div>
				<div class="v">
					<select value={$theme.title}>
						{#each $themes.sort((a, b) => a.title.localeCompare(b.title)) as value}
							<option value={value.title}>{value.title}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="kv themes">
				<div class="k">Themes</div>
				<div class="v col" use:autoAnimate>
					{#each $themes as t, i (t.title)}
						<button
							class:active={$theme.title === t.title}
							on:click={() => themer.theme.set(t)}
						>
							<button
								use:hover={{ pollRate: 100 }}
								on:hoverIn={() => (showDeleteText[i] = true)}
								on:hoverOut={() => (showDeleteText[i] = false)}
								title="delete theme"
								class="delete"
								on:click={() => themer.delete(t)}
							>
								🆇
							</button>

							{#if showDeleteText[i]}
								<div
									in:fly={{ x: 5, easing: quadIn }}
									out:fly={{ x: 20, easing: quadOut, duration: 300 }}
									class="delete-text">delete</div
								>
							{:else}
								<div
									in:fly={{ x: -5, easing: quadIn }}
									out:fly={{ x: -20, easing: quadOut, duration: 300 }}
									>{t.title}</div
								>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<div class="kv toJSON">
				<div class="k">console.log</div>
				<div class="v">
					<button on:click={() => console.log(themer.toJSON())}>toJSON</button>
				</div>
			</div>

			<!-- <div class="kv theme-a">
				<div class="v">
					<button on:click={() => themer.create(theme1)}> add theme-1 </button>
				</div>
			</div> -->

			<div class="kv clear">
				<div class="v">
					<button on:click={() => themer.clear()}>clear</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.root {
		position: fixed;
		top: var(--top, 0);
		right: var(--right, 0);

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
		gap: 0.5rem;

		div {
			font-size: 1rem;
			color: var(--fg-c);
		}
	}

	.kv {
		display: flex;
		align-items: center;
		// justify-content: center;
		gap: 0.5rem;

		width: 100%;
		padding: 0.5rem;

		color: var(--fg-c);
		outline: 1px solid rgba(var(--bg-b-rgb), 0.5);
		border-radius: var(--radius);

		font-size: 1rem;

		.k {
			display: flex;

			width: fit-content;
			min-width: 5rem;
			max-width: 50%;

			font-weight: 600;
			font-size: var(--font-xs);
			font-family: var(--font-b);
		}

		.v {
			all: unset;
			box-sizing: border-box;

			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 0.25rem;

			width: 100%;

			font-family: var(--font-mono);

			select {
				// all: unset;
				cursor: pointer;

				width: 100%;
				padding: 0.2rem 0.5rem 0.23rem 0.5rem;
				text-align: center;

				color: var(--theme-a);
				background: var(--bg-b);
				border-radius: var(--radius-sm);
				border: 1px solid var(--bg-c);

				font-weight: 300;
				transition:
					border-color 0.15s,
					font-weight 0.6s;

				&:hover {
					border-color: rgba(var(--theme-a-rgb), 0.33);

					font-weight: 500;
				}
			}

			button {
				all: unset;
				position: relative;
				box-sizing: border-box;
				cursor: pointer;

				width: 100%;
				margin: auto;
				padding: 0.2rem 0.5rem 0.23rem 0.5rem;
				text-align: center;

				display: grid;
				div {
					grid-area: 1 / 1;
				}

				background: var(--bg-b);
				border-radius: var(--radius-sm);
				border: 1px solid var(--bg-c);
				div {
					color: var(--theme-a);
				}

				font-weight: 300;
				transition:
					border-color 0.15s,
					font-weight 0.6s;

				&:hover {
					border-color: rgba(var(--theme-a-rgb), 0.33);

					font-weight: 500;
				}

				&.active:not(:has(.delete:hover)) {
					div {
						color: var(--bg-b);
					}
					background: var(--theme-a);
					// border-color: var(--theme-a);
				}

				&:has(.delete:hover) {
					div {
						color: tomato;
					}
				}

				.delete {
					all: unset;
					position: absolute;
					right: 0.25rem;
					top: 0;
					bottom: 0;

					width: 1rem;
					height: 1rem;
					margin: auto;
					padding: 0.05rem;
					// padding-top: 0;

					color: var(--bg-a);
					// outline: 1px solid rgba(255, 99, 71, 0.45);
					border-radius: 0.2rem;

					opacity: 0;
					transition-property: opacity, color, background;
					transition-duration: 0.15s;
					z-index: 1;

					&:hover {
						background: var(--fg-a);
						// background: tomato;
						// color: var(--bg-a);
						color: tomato !important;
					}
				}

				&:hover .delete {
					opacity: 1;
				}
			}
		}
	}
</style>
