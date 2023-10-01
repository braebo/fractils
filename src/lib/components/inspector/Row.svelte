<script lang="ts">
	import type { Writable, Readable } from 'svelte/store'

	import { nanoid } from 'nanoid'

	export let key: string
	export let value: unknown
	export let store: Writable<any> | Readable<any>
	export let path: string
	export let simple = false
	export let label = true
	export let depth = 0
	depth++

	const uid = nanoid(4)

	const set = (obj: Writable<any>, path: string | string[], value: unknown) => {
		// Regex explained: https://regexr.com/58j0k
		const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g)

		pathArray.reduce((acc: Record<string, any>, key, i) => {
			if (acc[key] === undefined) acc[key] = {}
			if (i === pathArray.length - 1) acc[key] = value
			return acc[key]
		}, obj)
	}

	function updateStore(value: boolean | string) {
		// Single value
		if (simple && 'subscribe' in store) {
			$store = value
			// Array or Object
		} else {
			if ('update' in store)
				store.update((u) => {
					let newData = { ...u }
					set(newData, path, value)
					return newData
				})
		}
	}
</script>

<div class="kv" style:--hue={depth % 360}>
	{#if value !== null}
		{#if typeof value === 'object'}
			{#if Array.isArray(value)}
				{#if label}
					<div class="key">{key}{':'}</div>
				{/if}
				<!-- Array -->
				{#each value as nestedValue, index}
					<svelte:self {key} {store} label={false} value={nestedValue} path={path + '[' + index + ']'} />
				{/each}
			{:else}
				{#if label}
					<div class="key">{key}{':'}</div>
				{/if}
				<div class="nested">
					{#each Object.entries(value) as [nestedKey, nestedValue]}
						<svelte:self
							key={nestedKey}
							value={nestedValue}
							{store}
							path={path + '.' + nestedKey}
							{depth}
						/>
					{/each}
				</div>
			{/if}
		{:else}
			<label class="store-container" for="{path}-{uid}">
				{#if label}
					<div class="key">{key}{':'}</div>
				{/if}
				{#if typeof value === 'string'}
					<input id={path} type="text" {value} on:input={(e) => updateStore(e.currentTarget.value)} />
				{:else if typeof value === 'boolean'}
					<input
						id="{path}-{uid}"
						type="checkbox"
						checked={value}
						on:change={(e) => {
							updateStore(e.currentTarget.checked)
						}}
					/>
				{:else if typeof value === 'number'}
					<input
						id={path}
						type="number"
						{value}
						on:change={(e) => {
							updateStore(e.currentTarget.value)
						}}
					/>
				{/if}
			</label>
		{/if}
	{/if}
</div>

<style>
	.kv {
		display: flex;
		flex-direction: column;
		/* align-items: center; */
		justify-content: center;
		box-sizing: border-box;
		height: fit-content;
		width: 100%;
	}
	.key {
		font-size: var(--font-small);
		color: var(--key-color);
		opacity: 0.9;
		width: 100%;
	}

	.store-container {
		display: flex;
		align-items: baseline;
		justify-content: flex-start;
		margin-bottom: 2px;
		width: 100%;
	}

	input {
		flex-grow: 1;

		background: var(--background-int);
		color: var(--value-color);
		border: 0;
		border-radius: 1px;
		border-bottom: 1px solid var(--balue-);
		/* outline-offset: 1px; */

		min-width: 100%;
		width: 100%;

		font-size: var(--font-small);
		font-family: 'MonoLisa', monospace;
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='checkbox'] {
		min-width: max-content;
		margin: 0 100% 0 10px;
		transform: translateY(2px);
		background-color: var(--background-int);
		filter: brightness(0.1);
		cursor: pointer;
		padding: 0 10px;
	}
	input[type='checkbox']:checked {
		filter: brightness(1);
	}

	/* Firefox */
	input[type='number'] {
		-moz-appearance: textfield;
	}

	[type='number'] {
		width: 80px;
	}

	.nested {
		margin: 10px 0 10px 15px;
	}
</style>
