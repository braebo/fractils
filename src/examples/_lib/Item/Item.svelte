<script>
	import { mobile } from '$lib'

	export let title = 'title'
	export let type = 'type'
	export let path = '';
</script>

<div class="item" class:mobile={$mobile}>
	<header>
		<a href="#{title}"><h1 id={title}>{title}</h1></a>
		<p class="code">{type}</p>
	</header>

	<div class="description" class:mobile={$mobile}>
		<slot name="description" />
	</div>

	<slot />

	<a
		class="link"
		target="_blank"
		href="https://github.com/FractalHQ/fractils/blob/main/src/lib/{path}">{'</>'}</a
	>
</div>

<style lang="css">
	.item {
		display: flex;
		position: relative;
		flex-direction: column;
		gap: 0.5rem;

		width: var(--col);
		margin: 3rem auto;
		padding: 1rem;

		color: var(--fg-c);
		background: var(--bg-b);

		border-radius: var(--border-radius);
		box-shadow: var(--shadow-lg);

		font-family: var(--font-b);

		outline: none;
		z-index: 1;
	}

	.item h1 {
		font-size: 1.5rem;
		color: var(--fg-a);
	}

	:global(:not(pre) > code[class*='language-']),
	:global(pre[class*='language-']) {
		font-family: var(--font-b);
		background: var(--bg-a) !important;
	}

	.item a {
		text-decoration: none;
	}
	.item a:hover {
		text-decoration: underline;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.mobile {
		font-size: 0.9rem;
	}

	:global(.param) {
		display: flex;
		gap: 0.5rem;

		margin-top: 1rem;
	}

	.description {
		display: flex;

		padding-bottom: 1rem;
	}

	.link {
		position: absolute;
		bottom: 0;
		right: 0;

		padding: 1.2rem;

		font-family: var(--mono);
		font-variation-settings: 'wght' 600;
	}
	.link:hover {
		font-variation-settings: 'wght' 900;
		text-decoration: none !important;
	}
</style>
