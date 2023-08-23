// Stores

export { mobile, screenH, screenW, scrollY, mouse, mobileThreshold } from './stores/Device.svelte';

// Components

export { default as MacScrollbar } from './components/MacScrollbar.svelte';
export { default as ThemeToggle } from './components/ThemeToggle.svelte';
export { default as OnMount } from './components/OnMount.svelte';
export { default as Range } from './components/Range.svelte';
export { default as Code } from './components/Code.svelte';

// Theme

export { initTheme, toggleTheme, applyTheme, theme } from './theme';

// Utils

export { asyncLocalStorageStore } from './utils/asyncLocalStorageStore';
export { stringify, type StringifyOptions } from './utils/stringify';
export { localStorageStore } from './utils/localStorageStore';
export { entries, keys, values } from './utils/object';
export { decimalToPow } from './utils/decimalToPow';
export { truncate } from './utils/truncate';
export { mapRange } from './utils/mapRange';
export { clamp } from './utils/clamp';
export { wait } from './utils/wait';
export { log } from './utils/log';

// Actions

export { default as Device } from './stores/Device.svelte';
// legacy
export { default as Fractils } from './stores/Device.svelte';

export { clickOutside } from './actions/clickOutside';
export type {
	ClickOutsideEventDetail,
	ClickOutsideOptions,
	ClickOutsideEvent,
} from './actions/clickOutside';

export { visibility } from './actions/visibility';
export type {
	VisibilityEventDetail,
	VisibilityOptions,
	VisibilityEvent,
	ScrollDirection,
	VisibilityAttr,
	Direction,
	Position,
	Event,
} from './actions/visibility';

export { highlight } from './actions/highlight';
export type {
	HighlightEventDetail,
	HighlightOptions,
	HighlightEvent,
	HighlightAttr,
	ValidLanguage,
} from './actions/highlight';
