<script lang="ts">
	import { clickOutside, localStorageStore } from 'fractils';

	const x = localStorageStore('x', false);
</script>

<input type="checkbox" bind:checked={$x} />

{#if x}
	<div class="modal" use:clickOutside on:outclick={() => ($x = false)}>Hi</div>
{/if}

<style>
	.modal {
		position: absolute;
		inset: 0;

		width: 400px;
		height: 400px;
		margin: auto;

		box-shadow: 1px 1px 5px black;

		font-size: 15rem;
		text-align: center;
		line-height: 185%;
	}

	input {
		position: absolute;
		left: 5rem;
		top: 5rem;
		transform: scale(5);
	}
</style>
