<script lang="ts">
	import Params, { type Param } from '$examples/_lib/Item/Params.svelte';
	import Example from '$examples/_lib/Item/Example.svelte';
	import Item from '../_lib/Item/Item.svelte';
	import html from './Wait.html?raw';
	import { wait } from '$lib';

	let ready = false;
	let set = false;
	let go = false;

	async function start() {
		ready = true;
		await wait(500);
		set = true;
		await wait(500);
		go = true;
		await wait(1500);
		ready = false;
		set = false;
		go = false;
	}

	const path = 'utils/wait.ts';

	const params: Param[] = [
		{
			type: 'param',
			title: 't',
			description: 'Time to wait in ms.',
		},
		{
			type: 'returns',
			description: 'A promise that resolves after <span class="code inline">t</span> ms.',
		},
	];
</script>

<Item title="wait" type="function" {path}>
	<div slot="description">
		A simple wait timer.
		<Params {params} --width="110px" />
	</div>

	<Example --h="332px" {html}>
		<div class="result">
			<p class:active={ready}>ready</p>
			<p class:active={set}>set</p>
			<p class:active={go}>go</p>
		</div>
	</Example>
	<button on:click={() => start()}>start()</button>
</Item>

<style>
	p {
		text-align: center;
	}

	.active {
		color: green;
	}
</style>
