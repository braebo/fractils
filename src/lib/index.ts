/**
 * some stuff I often use
 *
 * @remarks Most are new and undocumented for now (until extractinator/docinator are done).
 */

// Stores

export { mobile, screenH, screenW, scrollY, mouse, mobileThreshold } from './stores/Device.svelte'
export { default as Fractils } from './stores/Device.svelte'
export { default as Device } from './stores/Device.svelte'

// Components

export { default as Inspector } from './components/inspector/Inspector.svelte'
export { default as MacScrollbar } from './components/MacScrollbar.svelte'
export { default as ThemeToggle } from './components/ThemeToggle.svelte'
export { default as Resizable } from './components/Resizable.svelte'
export { Toasts, toast, type Toast } from './components/toast/index'
export { default as OnMount } from './components/OnMount.svelte'
export { default as Tooltip } from './components/Tooltip.svelte'
export { default as Switch } from './components/Switch.svelte'
export { default as Froggo } from './components/Froggo.svelte' // wow
export { default as Range } from './components/Range.svelte'
export { default as Code } from './components/Code.svelte'

// Gui

export { default as Select } from './gui/controls/Select.svelte'
export { default as Root } from './gui/Gui.svelte'

// Theme

export { initTheme, toggleTheme, applyTheme, theme } from './theme/theme'
export { default as ThemerComponent } from './themer/Themer.svelte'
export { Themer } from './themer/Themer'

// Icons

export { default as Github } from './icons/Github.svelte'
export { default as Copy } from './icons/Copy.svelte'

// Utils

export { highlight, HIGHLIGHT_DEFAULTS, type HighlightOptions } from './utils/highlight'
export { isTouchEvent, isMouseEvent, isDefined, isString } from './utils/is'
export { l, n, r, g, lg, b, y, c, o, m, p, dim, bd, i, j } from './utils/l'
export { coerce, coerceObject, type CoerceValue } from './utils/coerce'
export { asyncLocalStorageStore } from './utils/asyncLocalStorageStore'
export { start, fmtTime, type StartOptions } from './utils/time'
export { debrief, type DebriefOptions } from './utils/debrief'
export { localStorageStore } from './utils/localStorageStore'
export { ArgMap, mapArgs, resolveArg } from './utils/args'
export { stringify, serialize } from './utils/stringify'
export { entries, keys, values } from './utils/object'
export { decimalToPow } from './utils/decimalToPow'
export { cliHyperlink } from './utils/cliHyperlink'
export { state, type State } from './utils/state'
export { partition } from './utils/partition'
export { timestamp } from './utils/timestamp'
export { rgbToHex } from './utils/rgbToHex'
export { hexToRgb } from './utils/hexToRgb'
export { truncate } from './utils/truncate'
export { fontSize } from './utils/fontSize'
export { mapRange } from './utils/mapRange'
export { nanoid } from './utils/nanoid'
export { create } from './utils/create'
export { defer } from './utils/defer'
export { clamp } from './utils/clamp'
export { getPx } from './utils/getPx'
export { wait } from './utils/wait'
export { log } from './utils/log'

// Color

export { Color, isColor, isColorFormat, parseColorFormat } from './color/color'
export type { ColorMode, ColorValue } from './color/color'

export { CSS_COLORS, CSS_COLOR_NAMES, randomCSSColorName } from './color/css'
export type { CSSColorName, HexColor } from './color/css'

// Actions

export { fullscreen, type FullscreenOptions } from './actions/fullscreen'

export { add, type AddOptions } from './actions/add'

export { clickOutside } from './actions/clickOutside'
export type {
	ClickOutsideEventDetail,
	ClickOutsideOptions,
	ClickOutsideEvent,
} from './actions/clickOutside'

export { visibility } from './actions/visibility'
export type {
	VisibilityEventDetail,
	VisibilityOptions,
	VisibilityEvent,
	ScrollDirection,
	VisibilityAttr,
	Direction,
	Position,
	Event,
} from './actions/visibility'

export { highlighter } from './actions/highlighter'
export type { HighlightEventDetail, HighlightEvent, HighlightAttr } from './actions/highlighter'

export { resizable } from './actions/resizable'
export type { ResizableEvents } from './actions/resizable'
export type { ResizableOptions, Side } from './utils/resizable'

export { draggable, Draggable, DRAGGABLE_DEFAULTS } from './utils/draggable'
export type {
	DraggableOptions,
	// VirtualBounds,
	DragEventData,
	DragEvents,
	DraggablePlacementOptions,
	VirtualRect,
} from './utils/draggable'
