export default `<script lang="ts">
	import { clickOutside } from 'fractils'

	let clickedOutside

	function handleClickOutside(e: CustomEvent) {
		clickedOutside = true
		console.log(e.detail.target) // the element that was clicked
	}
<\/script>

<div
	use:clickOutside="{{ whitelist: ['notme'] }}"
	on:outclick="{handleClickOutside}"
>
	clickedOutside = {clickedOutside}
</div>

<div class="notme">🚫</div>`