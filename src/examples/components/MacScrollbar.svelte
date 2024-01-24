<script>
	import Example from '$examples/_lib/Item/Example.svelte';
	import Params from '$examples/_lib/Item/Params.svelte';
	import Item from '../_lib/Item/Item.svelte';
	import html from './MacScrollbar.html?raw';

	const path = 'components/MacScrollbar.svelte';
</script>

<Item title="MacScrollbar" type="component" {path}>
	<div slot="description">
		<p>Replaces the default scrollbar with a MacOS-style scrolbar.</p>
		<em>
			You probably shouldn't use this for anything that needs to be accessible (most things).
		</em>
	</div>

	<Params
		params={[
			{
				type: 'string',
				title: 'root',
				description:
					`The root element used to scroll.  ` +
					`Defaults to <span class="code inline">body</span>, but it can be replaced with HTMLElement or query selector.  `,
			},
		]}
	/>
	<br />
	<Example file={'src/routes/__layout.svelte'} {html}>
		<div class="result">
			<div>
				<em>You can see it when you scroll on this page -> </em>
			</div>
		</div>
	</Example>
</Item>

<style>
	.result {
		display: flex;
		justify-content: center;

		min-height: 54px;

		border-radius: var(--radius);

		overflow: hidden;
		color: white;
	}
</style>
