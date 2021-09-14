<script lang="ts">
	import ClickOutside from '$lib/ClickOutside.svelte';
	import { browser } from 'fractils';
	import { dev } from 'fractils';
</script>

dev: {typeof dev}, {dev}

<br />

browser: {typeof browser}, {browser}

<br />

<ClickOutside />
