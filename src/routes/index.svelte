<script context="module">
	export const prerender = true
</script>

<script lang="ts">
	import LocalStorageStore from '$examples/utils/LocalStorageStore.svelte'
	import ThemeToggle from '$examples/components/ThemeToggleExample.svelte'
	import MacScrollbar from '$examples/components/MacScrollbar.svelte'
	import ClickOutside from '$examples/actions/ClickOutside.svelte'
	import Visibility from '$examples/actions/Visibility.svelte'
	import ThemePulse from '$examples/_lib/ThemePulse.svelte'
	import OnMount from '$examples/components/OnMount.svelte'
	import MapRange from '$examples/utils/MapRange.svelte'
	import Device from '$examples/stores/Device.svelte'
	import Theme from '$examples/utils/Theme.svelte'
	import Wait from '$examples/utils/Wait.svelte'
	import Log from '$examples/utils/Log.svelte'
</script>

<h2 id="components">
	<a class="double-under" href="#components">components</a>
</h2>

<OnMount />

<MacScrollbar />

<h2 id="utils"><a class="double-under" href="#utils">utils</a></h2>

<Device />

<LocalStorageStore />

<Log />

<Wait />

<MapRange />

<h2 id="theme"><a class="double-under" href="#theme">theme</a></h2>

<ThemePulse />

<Theme />

<ThemeToggle />

<h2 id="actions"><a class="double-under" href="#actions">actions</a></h2>

<ClickOutside />

<Visibility />

<div class="buffer" style="min-height: 50px" />

<style lang="scss">
	h2 {
		display: flex;
		justify-content: center;
	}
	a {
		position: relative;

		max-width: fit-content !important;
		margin: 5rem auto -2rem auto;
		padding: 0 1rem;

		text-align: center;
		text-decoration: none;

		color: white;
	}
	a:first-of-type {
		margin-top: 2.5rem;
	}
</style>
