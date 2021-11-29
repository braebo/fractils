<script>
	import Example from '$examples/_lib/Item/Example.svelte'
	import Params from '$examples/_lib/Item/Params.svelte'
	import Item from '../_lib/Item/Item.svelte'

	const example = `<script>
    import { MacScrollbar } from 'fractils'
<\/script>

<MacScrollbar />
`

	const path = 'components/MacScrollbar.svelte'
</script>

<Item title="MacScrollbar" type="component" {path}>
	<div slot="description">Replaces the default scrollbar with a MacOS-style scrolbar.</div>

	<Params
		params={[
			{
				type: 'string',
				title: 'root',
				description: `The root element used to scroll.  Defaults to <span class="code inline">#svelte</span>, 
				but it can be replaced with an id, classname, or HTMLElement`,
			},
		]}
	/>
	<br />
	<Example {example} file={'src/routes/__layout.svelte'}>
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

		border-radius: var(--border-radius);

		overflow: hidden;
	}
</style>
