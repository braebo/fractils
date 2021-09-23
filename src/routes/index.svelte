<script context="module">
	export const prerender = true
</script>

<script lang="ts">
	import AsyncLocalStorageStore from '$examples/utils/AsyncLocalStorageStore.svelte'
	import ThemeToggle from '$examples/components/ThemeToggleExample.svelte'
	import ClickOutside from '$examples/actions/ClickOutside.svelte'
	import OnMount from '$examples/components/OnMount.svelte'
	import ThemePulse from '$examples/_lib.svelte/ThemePulse.svelte'
	import Device from '$examples/stores/Device.svelte'
	import Theme from '$examples/utils/Theme.svelte'
	import Wait from '$examples/utils/Wait.svelte'
	import Log from '$examples/utils/Log.svelte'
</script>

<h2 id="actions">actions</h2>

<ClickOutside />

<h2 id="components">components</h2>

<OnMount />

<ThemePulse />

<ThemeToggle />

<h2 id="utils">utils</h2>

<Theme />

<Device />

<AsyncLocalStorageStore />

<Log />

<Wait />

<div class="buffer" style="min-height: 50px" />

<style>
	h2 {
		margin: 5rem auto -2rem auto;
		padding: 0 1rem;

		text-align: center;

		color: white;
	}
	h2:first-of-type {
		margin-top: 2.5rem;
	}
</style>
