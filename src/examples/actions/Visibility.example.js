export default `<script>
	import { bounceOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	import { visibility } from 'fractils'
	
	let visible, scrollDir, options = { threshold: 0.75 }

	function handleChange(e) {
		visible = e.detail.isVisible
		scrollDir = e.detail.scrollDirection
	}
<\/script>

<div use:visibility={options} on:v-change={handleChange}>
	{#if visible}
		<div in:fly={{ y: -20, easing: bounceOut }}>
			going {scrollDir === 'down' ? '⬇' : '⬆'}
		<\/div>
	{\/if}
<\/div>`