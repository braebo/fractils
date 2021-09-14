<script lang="ts">
	import { clickOutside } from 'fractils';

	let clickedOutside = false;
	const handleClickOutside = (e: CustomEvent) => {
		console.log(e);
		clickedOutside = true;
		setTimeout(() => {
			clickedOutside = false;
		}, 500);
	};
</script>

<div class="clickoutside" use:clickOutside={handleClickOutside}>
	clickedOutside: {clickedOutside}
</div>

<style>
	.clickoutside {
		background-color: #ccc;
		border: 1px solid #000;
		justify-content: center;
		align-items: center;
		display: flex;
		width: 500px;
		height: 50px;
	}
</style>
