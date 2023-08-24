// import { entries } from '$lib/utils/object'

import Device from './stores/Device.svelte';
import LocalStorageStore from './utils/LocalStorageStore.svelte';
import Log from './utils/Log.svelte';
import Wait from './utils/Wait.svelte';
import MapRange from './utils/MapRange.svelte';
import Clamp from './utils/Clamp.svelte';
import Theme from './utils/Theme.svelte';
import ThemeToggle from './components/ThemeToggle.svelte';
import ClickOutside from './actions/ClickOutside.svelte';
import Visibility from './actions/Visibility.svelte';
import OnMount from './components/OnMount.svelte';
import MacScrollbar from './components/MacScrollbar.svelte';

export const EXAMPLES = {
	utils: {
		device: Device,
		localStorageStore: LocalStorageStore,
		log: Log,
		wait: Wait,
		mapRange: MapRange,
		clamp: Clamp,
	},
	theme: {
		ThemeToggle,
		theme: Theme,
	},
	actions: {
		clickOutside: ClickOutside,
		visibility: Visibility,
	},
	components: {
		OnMount,
		MacScrollbar,
	},
} as const;
