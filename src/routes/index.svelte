<script lang="ts">
	import ClickOutside from '../test/ClickOutside.svelte'
	import Browser from '../test/Browser.svelte'
	import OnMount from '../test/OnMount.svelte'
	import Wait from '../test/Wait.svelte'
	import Nav from '../test/Nav.svelte'
	import Dev from '../test/Dev.svelte'
</script>

<header>
	<h1>fractils</h1>
	<p class="description">
		<span style="font-style: normal !important; font-size: 0.9rem;"
			>npm i -D fractils</span
		>
	</p>
</header>

<Nav />

<h2 id="env">env</h2>

<Dev />

<Browser />

<h2 id="actions">actions</h2>

<ClickOutside />

<h2 id="components">components</h2>

<OnMount />

<h2 id="utils">utils</h2>

<Wait />

<br />
<br />
<br />
<br />

<style>
	header {
		color: white;
		padding-top: 0.5rem;
	}
	h1,
	h2,
	p {
		padding: 0 1rem;
		color: white;
	}
	h2 {
		text-align: center;
		margin: 5rem auto -2rem auto;
	}
	h2:first-of-type {
		margin-top: 2.5rem;
	}
</style>
