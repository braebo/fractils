import { objectEntries } from '$lib/utils/object.js'

import OnMount from './components/OnMount.svelte'
import MacScrollbar from './components/MacScrollbar.svelte'
import Device from './stores/Device.svelte'
import LocalStorageStore from './utils/LocalStorageStore.svelte'
import Log from './utils/Log.svelte'
import Wait from './utils/Wait.svelte'
import MapRange from './utils/MapRange.svelte'
import Clamp from './utils/Clamp.svelte'
import Theme from './utils/Theme.svelte'
import ThemeToggle from './components/ThemeToggle.svelte'
import ClickOutside from './actions/ClickOutside.svelte'
import Visibility from './actions/Visibility.svelte'

export const EXAMPLES = new Map([
	...objectEntries({
		COMPONENTS: {
			OnMount,
			MacScrollbar,
		},
		UTILS: {
			Device,
			LocalStorageStore,
			Log,
			Wait,
			MapRange,
			Clamp,
		},
		THEME: {
			Theme,
			ThemeToggle,
		},
		ACTIONS: {
			ClickOutside,
			Visibility,
		},
	} as const),
])
