<script lang="ts">
	import type { PageServerData } from './$types'
	import type { KeyData } from '$lib/utils/keys'

	import { stringify } from '$lib/utils/stringify'
	import Code from '$lib/components/Code.svelte'
	import { quintOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	import * as ua from '$lib/utils/ua'
	import { getInfo } from './getInfo'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	interface Info {
		platforms: { k: string; v: string | boolean }[]
		modifiers: { k: string; v: KeyData }[]
	}

	export let data: PageServerData

	let mode: 'client' | 'server' =
		$page.url.searchParams.get('mode') === 'server' ? 'server' : 'client'

	let info: {
		client: Info
		server: Info
	}

	onMount(() => {
		info = {
			client: getInfo(),
			server: data.info,
		}
	})
</script>

<div class="br"></div>

<div class="page">
	{#if info}
		{@const { platforms, modifiers } = info[mode]}

		<!-- {#if platforms.length && modifiers.length} -->
		<div class="modes">
			<button
				class="mode client"
				class:active={mode === 'client'}
				on:click={() => (mode = 'client')}
			>
				client
			</button>
			<button
				class="mode server"
				class:active={mode === 'server'}
				on:click={() => (mode = 'server')}
			>
				server
			</button>
		</div>

		<div class="br" />

		{#key mode}
			<section
				class="os"
				in:fly={{ y: 5, duration: 250, delay: 150, easing: quintOut }}
				out:fly={{ y: 5, duration: 250, delay: 0, easing: quintOut }}
			>
				<ul class="platforms">
					{#each platforms as { k, v }}
						{#if k === ''}
							<hr style="color:var(--bg-d);width:100%" />
						{:else if typeof v === 'boolean' || typeof v === 'string'}
							<li class:true={v === true} class:string={typeof v === 'string'}>
								<div class="k">{k}</div>
								<div class="v">{v}</div>
							</li>
						{/if}
					{/each}
				</ul>

				<ul class="modifiers">
					{#each modifiers as { k, v }}
						<li class="modifiers {k}">
							<div class="k type">{k}</div>

							<div class="code">
								<div class="kv">
									<div class="k">icon</div>
									<div class="v">{v.icon}</div>
								</div>

								<div class="kv">
									<div class="k">key</div>
									<div class="v">{v.key}</div>
								</div>

								<div class="kv">
									<div class="k">name</div>
									<div class="v">{v.name}</div>
								</div>
							</div>
						</li>
					{/each}
				</ul>

				<div class="br" />

				<!-- <div class="ua">
					{#await highlight( stringify({ 'platform ': window.navigator.platform, userAgent: window.navigator.userAgent }, 2)
							.replace(/^\s+/gm, '')
							.replaceAll(/"|{|}|/g, '')
							.replace('\n', ''), { lang: 'elm', theme: 'serendipity' }, ) then _}
						<pre class="shiki-wrapper">{@html _}</pre>
					{/await}
				</div> -->

				<div class="ua">
					<Code
						title="User Agent"
						lang="elm"
						--height="7rem"
						text={stringify(
							{
								os: ua.getOS(),
								browser: ua.getBrowser(),
								'navigator.platform': window.navigator.platform,
								'navigator.userAgent': window.navigator.userAgent,
							},
							2,
						)
							.replace(/^\s+/gm, '')
							.replaceAll(/"|{|}/g, '')
							.replace('\n', '')}
					/>
				</div>
			</section>
		{/key}
	{/if}
	<!-- {/if} -->
</div>

<div class="br-lg"></div>

<style lang="scss">
	.page {
		display: grid;
	}
	section {
		grid-area: 2/1;

		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 2rem;

		width: min(98vw, 40rem);
		margin: auto;
	}

	ul {
		display: flex;
		flex-direction: column;

		width: 15rem;
		margin: auto;
		padding: 1rem;

		background: var(--bg-b);
		border-radius: var(--radius);
		box-shadow: var(--shadow-lg);

		line-height: 1.33rem;
		list-style: none;
		font-family: var(--font-b);

		animation: fly-up;
	}

	:root[theme='light'] {
		background: var(--bg-a);
	}

	li {
		display: grid;
		grid-template-columns: 1fr 1fr;

		&:not(.string) {
			color: tomato;
		}

		&.true {
			color: lightgreen;
		}

		&:has(.code) {
			grid-template-columns: 1fr;
		}
	}

	.k {
		color: var(--fg);
	}

	.v {
		display: flex;
		color: var(--fg);
		justify-content: flex-end;
	}

	.k.type {
		text-align: center;
		color: var(--fg-d);
	}

	ul.modifiers {
		display: grid;
		grid-template-columns: repeat(2, 1fr);

		gap: 1rem;
		padding: 0.25rem;
		background: none;
		box-shadow: none;

		width: fit-content;

		.code {
			width: 100%;
			height: 100%;
			margin: auto;
			padding: 0.25rem 0.5rem;

			background: var(--dark-b);
			box-shadow: var(--shadow-sm);

			.kv {
				display: flex;

				.k {
					width: 3rem;
					font-size: var(--font-xs);
					color: var(--fg-d);
					color: var(--theme-a);
				}
				.v {
					// color: var(--theme-b);
					color: #f8d2c9;
					font-size: var(--font-sm);
				}
			}
		}
	}

	:global(:root[theme='light'] section.os) {
		.code {
			background: var(--dark-d);
		}

		ul.platforms {
			background: var(--dark-d);
		}
	}

	.modes {
		display: flex;
		justify-content: center;
		gap: 1rem;

		width: fit-content;
		margin: 2rem auto;

		border-radius: 0.2rem;

		.mode {
			display: grid;
			grid-template-columns: 1fr;
			gap: 0.5rem;

			width: 3.9rem;
			padding: 0.25rem 0.5rem;

			box-shadow: var(--shadow-sm);
			border-radius: 0.2rem;
			font-size: 1.2rem;
			color: var(--fg-c);
			&.active {
				background: var(--dark-e);
				color: var(--theme-a);
			}
			outline: 1px solid var(--bg-c);
			border: none;

			cursor: pointer;
		}
	}

	.ua {
		width: fit-content;
		margin: 2rem auto;

		border-radius: var(--radius);
		box-shadow: var(--shadow-lg);
		overflow-x: auto;
		max-width: calc(100vw - 2rem);

		font-size: 0.75rem;
		// outline: 1px solid var(--bg-d);

		// .shiki-wrapper {
		// 	box-shadow: var(--shadow-inset);
		// }
	}

	// :global(:root[theme='light'] section.os) {
	// 	.ua {
	// 		.shiki-wrapper {
	// 			background: var(--fg-d);
	// 		}
	// 	}
	// }
</style>
