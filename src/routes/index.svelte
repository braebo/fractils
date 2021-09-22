<script context="module">
	export const prerender = true
</script>

<script lang="ts">
	import AsyncLocalStorageStore from '$examples/utils/AsyncLocalStorageStore.svelte'
	import ThemeToggle from '$examples/components/ThemeToggleExample.svelte'
	import ClickOutside from '$examples/actions/ClickOutside.svelte'
	import OnMount from '$examples/components/OnMount.svelte'
	import Wait from '$examples/utils/Wait.svelte'
	import Log from '$examples/utils/Log.svelte'
	import Nav from '$examples/Nav.svelte'
	import Theme from '$examples/theme/Theme.svelte'
</script>

<header>
	<h1>fractils</h1>
	<p class="description">
		<span style="font-style: normal !important; font-size: 0.9rem;"> npm i -D fractils </span>
	</p>
</header>

<Nav />

<h2 id="actions">actions</h2>

<ClickOutside />

<h2 id="components">components</h2>

<OnMount />

<ThemeToggle />

<h2 id="utils">utils</h2>

<!-- TODO: THEME -->
<Theme />

<AsyncLocalStorageStore />

<Log />

<Wait />

<div class="buffer" style="min-height: 50px" />

<style>
	header {
		padding-top: 0.5rem;

		color: white;
	}
	h1,
	h2,
	p {
		padding: 0 1rem;

		color: white;
	}
	h2 {
		margin: 5rem auto -2rem auto;

		text-align: center;
	}
	h2:first-of-type {
		margin-top: 2.5rem;
	}
</style>
