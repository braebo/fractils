<script lang="ts">
	import { activeBookmarks, activeFolder, activeFolderBookmarks, tagFilter } from '$lib/data/dbStore'
	import { gridDimensions, grid } from '$lib/stores/gridStore'
	import { settings, showSettings } from '$lib/stores'

	import Inspector from './Inspector.svelte'
	import * as stores from '$lib/stores'
</script>

<Inspector
	register={{
		...stores,
		activeBookmarks,
		activeFolder,
		activeFolderBookmarks,
		tagFilter,
		settings,
		showSettings,
		gridDimensions,
		grid,
	}}
/>
