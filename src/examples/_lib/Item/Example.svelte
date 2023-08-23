<script script lang="ts">
	export let result = true;
	export let file: string | null = null;
	export let html: string | null = null;

	interface AddOptions {
		/**
		 * The class(es) to add to the element.
		 */
		class?: string | string[];
		target?: (node: HTMLElement) => HTMLElement;
		transform?: (node: HTMLElement) => void;
	}

	const ADD_OPTIONS_DEFAULTS = {
		class: '' as string | string[],
	} as const satisfies AddOptions;

	const addScrollbars = {
		class: 'scrollbars',
		target: (node: HTMLElement) => {
			return node.firstChild as HTMLElement;
		},
	};

	function add(node: HTMLElement, options: AddOptions) {
		const { class: c } = { ...ADD_OPTIONS_DEFAULTS, ...options };
		Array.isArray(c) ? node.classList.add(...c) : node.classList.add(c);
	}
</script>

<div class="codeblock">
	{#if file}
		<div class="file">{file}</div>
	{/if}

	{#if html}
		<div class="shiki" use:add={addScrollbars}>
			{@html html}
		</div>
	{/if}
</div>

<span style="display: {!result ? 'none' : 'content'};">
	<h6>↓</h6>
	<div class="result">
		<slot />
	</div>
</span>

<style lang="scss">
	$box-shadow: 0 0 5px 0 #000 inset;

	.codeblock {
		position: relative;

		overflow: auto;
	}

	.shiki {
		padding: 1rem 1.25rem;
		margin: 0;

		background: var(--bg-a);
		border-radius: var(--border-radius);
		box-shadow: $box-shadow;

		font-size: 0.9rem;
		font-family: var(--mono);
		line-height: 1.5;
	}

	:global(code) {
		position: relative;

		transition: 0.2s;
	}

	h6 {
		text-align: center;
		font-size: 1.5rem;
	}

	.result {
		width: 75%;
		margin: 5px auto;
		min-height: 50px;

		text-align: center;

		background: var(--result-bg, var(--bg-a));
		border-radius: var(--border-radius);
		box-shadow: $box-shadow;

		z-index: 3;
	}

	:global(.result .value) {
		background: var(--bg-a);
	}

	:global(.result:first-child) {
		padding: 1rem;
	}

	.file {
		position: absolute;
		right: 1rem;
		top: 0.5rem;

		width: max-content;

		font-family: var(--mono);

		opacity: 0.5;
		color: var(--fg-d);
	}
</style>
