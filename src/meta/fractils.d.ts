/**
 * some stuff I often use
 *
 * @remarks perpetual WIP
 *
 * @packageDocumentation
 */

/// <reference types="node" />
/// <reference types="svelte" />

import type { Action } from 'svelte/action';
import type { CodeToHastOptions } from 'shikiji';
import type { Instance } from 'tippy.js';
import type { Lang } from 'shiki';
import type { PopperElement } from 'tippy.js';
import { Readable } from 'svelte/store';
import { SvelteComponent } from 'svelte';
import type { Theme } from 'shiki';
import { Writable } from 'svelte/store';

declare const __propDef: {
    props: Record<string, never>;
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};

declare const __propDef_10: {
    /**
     * A styled code block with syntax highlighting.  On the client, the code is
     * highlighted using [Shikiji](https://github.com/antfu/shikiji) using the
     * {@link highlight} util unless the `ssr` prop is set to true and the highlighted
     * text is provided as the `highlightedText` prop.  The raw `text` prop is still
     * required in this case, as it's used for screen readers and the copy button.
     *
     * @example CSR
     *
     * A simple browser example:
     *
     * ```svelte
     * <script>
     * 	import Code from 'fractils'
     *
     * 	const text = `console.log('hello world')`
     * </script>
     *
     * <Code {text} />
     * ```
     *
     * @example SSR
     *
     * ```svelte +page.svelte
     * <script>
     * 	import Code from 'fractils'
     *
     * 	export let data
     * 	const { text, highlightedText } = data
     * </script>
     *
     * <Code ssr {text} {highlightedText} />
     * ```
     *
     * ```typescript +page.ts
     * import { highlight } from 'fractils/utils/highlight'
     *
     * export async function load({ page, fetch }) {
     * 	const text = `console.log('hello world')`
     * 	const highlightedText = await highlight(text, { lang: 'js' })
     *
     * 	return {
     * 		text,
     * 		highlightedText,
     * 	}
     * }
     * ```
     */
    props: {
        /**
         * The string to highlight.
         */ text?: string | undefined;
        /**
         * Effectively just disables the client-side highlighting,
         * assuming the text has already been highlighted on the server.
         * @defaultValue false
         */ ssr?: boolean | undefined;
        /**
         * Optional pre-highlighted text.  If this is provided _and_ the {@link ssr}
         * prop is `true`, the highlighter will not be loaded / run on the client.
         */ highlightedText?: string | undefined;
        /**
         * An optional title to display above the code block.
         * @defaultValue 'code'
         */ title?: string | undefined;
        /**
         * The language to use.  Must be a {@link ValidLanguage}.
         * @defaultValue 'json'
         */ lang?: (string & {}) | Lang | undefined;
        /**
         * The theme to use.
         * @defaultValue 'github'
         */ theme?: Theme | undefined;
        /**
         * If true, a button will be displayed to copy the code to the clipboard.
         * @defaultValue true
         */ copyButton?: boolean | undefined;
        /**
         * If true, the code block will be collapsed by default.
         */ collapsed?: boolean | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};

declare const __propDef_11: {
    props: {
        gui?: Gui | undefined;
        options?: Partial<GuiOptions> | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};

declare const __propDef_12: any;

declare const __propDef_2: {
    props: {
        register: Record<string, Writable<unknown> | Readable<unknown>>;
        top?: string | undefined;
        nub?: string | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};

declare const __propDef_3: {
    props: {
        /**
         * Displays debug info when true.
         */ debug?: boolean | undefined;
        /**
         * The scrollbar root element or it's query selector.
         * @default document.body
         */ root?: string | Element | null | undefined;
        /**
         * Destroys the component.
         * @default `true` on mobile
         * @note This component only works on viewport-sized elements.
         */ disabled?: boolean | undefined;
        /**
         * % of the scrollbar track to pad at the top and bottom.
         * @default 0.2
         */ padding?: number | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};

declare const __propDef_4: {
    props: {
        /**
         * Whether `initTheme` should be called automatically.
         * @default true
         */
        init?: boolean | undefined;
        /**
         * Icon transition animation options.
         */
        transitionOptions?: {
            /**
             * The y offset of the icon.
             * @default -35
             */
            y: number;
            /**
             * @default 1000
             */
            duration: number;
            /**
             * @default expoOut
             */
            easing: (t: number) => number;
        } | undefined;
    };
    slots: {
        default: {};
        light: {};
        dark: {};
    };
    events: {
        /**
         * Fires when the toggle is clicked and provides `event.detail.theme` as the new theme.
         */
        toggle: CustomEvent<{
            theme: 'light' | 'dark';
        }>;
    };
};

declare const __propDef_5: {
    props: Record<string, never>;
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};

declare const __propDef_6: {
    props: {
        top?: string | undefined;
        right?: string | undefined;
        bottom?: string | undefined;
        left?: string | undefined;
        margin?: string | undefined;
        direction?: "from-top" | "from-bottom" | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};

declare const __propDef_7: {
    props: {
        /**
         * Text content of the tooltip.
         */ content?: string | undefined;
        /**
         * Placement of the tooltip.
         * @defaultValue 'right'
         */ placement?: (string & {}) | "top" | "right" | "bottom" | "left" | undefined;
        /**
         * Intro & outro delay in ms.
         * @defaultValue [500, 100]
         */ delay?: [number, number] | undefined;
        interactive?: boolean | undefined;
        /**
         * Whether to show the arrow connecting the tooltip to the target.
         */ arrow?: boolean | undefined;
        /**
         * X and Y offset in px.
         * @defaultValue [10, 0]
         */ offset?: number[] | undefined;
        /**
         * Used to hide the tooltip.
         */ display?: "none" | (string & {}) | "contents" | undefined;
        instance?: Instance<PopperElement> | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};

declare const __propDef_8: {
    props: {
        /** The content to display when the switch is on. */
        on?: string | undefined;
        /** The content to display when the switch is off. */
        off?: string | undefined;
        /** Visible to screen readers / tooltips. */
        title?: string | undefined;
        /**
         * Whether the switch is checked or not.
         * @default false
         */
        checked?: boolean | undefined;
        /** Whether the switch is disabled or not. */
        disabled?: boolean | undefined;
        /** The outline color of the switch. */
        '--switch-outline'?: string | undefined;
        /** The primary color of the switch, used for the thumb. */
        '--switch-primary'?: string | undefined;
        /** The secondary color of the switch, used for the slider. */
        '--switch-secondary'?: string | undefined;
        /** The accent color of the switch. */
        '--switch-accent'?: string | undefined;
        /** The width of the switch. */
        '--switch-width'?: string | undefined;
        /** The padding of the switch. */
        '--switch-padding'?: string | undefined;
        /** The size of the switch thumb. */
        '--switch-thumb-size'?: string | undefined;
        /** The ratio of the switch thumb's width to height. */
        '--switch-thumb-ratio'?: string | undefined;
        /** The border-radius of the switch slider. */
        '--switch-slider-radius'?: string | undefined;
        /** The border-radius of the switch thumb. */
        '--switch-thumb-radius'?: string | undefined;
    };
    slots: {
        'thumb-content-on': {};
        'thumb-content-off': {};
        on: {};
        off: {};
    };
    events: {
        /** Toggles the switch. */
        change: MouseEvent;
    };
};

declare const __propDef_9: {
    props: {
        /**
         * The value to be controled by the slider.
         */
        value: number;
        /**
         * The minimum value allowed.
         */
        min?: number | undefined;
        /**
         * The maximum value allowed.
         */
        max?: number | undefined;
        /**
         * The amount to increment each change.
         */
        step?: number | undefined;
        /**
         * An optional title to be displayed above the slider.
         */
        name?: string | undefined;
        /**
         * Whether the slider should be vertical.
         */
        vertical?: boolean | undefined;
        /**
         * Whether to truncate the value to the step.
         */
        truncate?: boolean | undefined;
        /**
         * Callback function to be called on change.  Passes the updated value as an argument (and expects it to be returned).
         */
        callback?: ((value: number) => number) | undefined;
    };
    slots: {};
    events: {
        /**
         * Triggered when the slider value changes. Contains the new value, `event.detail.value`.
         * @remarks
         * If the `callback` prop is set, the value will be the result of the callback.
         */
        change: {
            value: number;
        };
    };
};

declare class __sveltets_Render<V> {
    props(): {
        key?: keyof V | undefined;
        value: V | Writable<V>;
        options: V[] | Writable<V[]>;
        v?: V | undefined;
        o?: V[] | undefined;
        k?: keyof V | undefined;
    };
    events(): {} & {
        [evt: string]: CustomEvent<any>;
    };
    slots(): {};
}

/**
 * Adds a class to an element.
 * @example
 * ```svelte
 * <div use:add={{class: 'foo'}} />
 * ```
 */
export declare const add: Action<Element, AddOptions>;

/**
 * Options for the `add` action.
 */
export declare interface AddOptions {
    /** The class(es) to add to the element. */
    class?: string | string[];
    /**
     * The target element.  Defaults to the element itself,
     * but can be used to target a child element.
     * @returns The new target element.
     * @example
     * ```svelte
     * <div use:add={{ target: (node) => node.firstChild }}>
     * ```
     */
    target?: (
    /** The dom element using the action. */
    node: HTMLElement) => HTMLElement;
    transform?: (node: HTMLElement) => void;
}

/**
 * Applies a specific theme
 * @param newTheme - The theme to apply
 */
export declare function applyTheme(newTheme: Theme_2): void;

export declare class ArgMap {
    args: string[];
    map: Map<string, string | number | boolean>;
    constructor(args: string[]);
    get(name: string): string | number | boolean | undefined;
    set(name: string, value: string | number | boolean): this;
    toObject(): {
        [k: string]: string | number | boolean;
    };
    /**
     * Resolves a long or short name to its value. If the name is not
     * found, it looks for an existing match of the first character
     * as an implicit short name.
     */
    resolve(name: string): string | number | boolean | undefined;
}

declare interface ArrayState<T> extends PrimitiveState<T[]> {
    push: (item: T) => void;
}

/**
 * A Svelte store that uses localStorage to store data asyncronously.
 * @param key - The key to store the data under.
 * @param value - The initial value of the store.
 * @returns a writable store.
 * @example
 * ```ts
 * const store = asyncLocalStorageStore('foo', 'bar')
 * ```
 */
export declare const asyncLocalStorageStore: <T = any>(key: string, value: T) => Writable<T>;

/** chalk.blue */
export declare function b(...args: unknown[]): string;

/** chalk.bold */
export declare function bd(...args: unknown[]): string;

/** chalk.cyan */
export declare function c(...args: unknown[]): string;

/**
 * Clamps a value between a min and max.
 */
export declare const clamp: (value: number, min: number, max: number) => number;

/**
 * Calls a function when the user clicks outside the element.
 * @example
 * ```svelte
 * <div on:outclick={someFunction} use:clickOutside={{ whitelist: ['.burger'] }}>
 * ```
 */
export declare const clickOutside: Action<Element, ClickOutsideOptions | undefined, ClickOutsideAttr>;

declare interface ClickOutsideAttr {
    'on:outclick'?: (event: ClickOutsideEvent) => void;
}

/**
 * Calls `outclick` when a parent element is clicked.
 */
export declare type ClickOutsideEvent = CustomEvent<ClickOutsideEventDetail>;

export declare interface ClickOutsideEventDetail {
    target: HTMLElement;
}

export declare interface ClickOutsideOptions {
    /**
     * Array of classnames.  If the click target element has one of these classes, it will not be considered an outclick.
     */
    whitelist?: string[];
}

/**
 * Creates an ANSI escape code formatted string for a clickable hyperlink in the terminal.
 *
 * @param url - The URL that the hyperlink will point to.
 * @param displayText - The text to be displayed in the terminal, which will be clickable.  If not provided, the URL will be used.
 * @returns The formatted string with ANSI escape codes for the hyperlink.
 *
 * @example
 * ```ts
 * console.log(createHyperlink("https://example.com", "Visit Example"));
 * // This will print a clickable hyperlink with the text "Visit Example" that opens https://example.com
 * ```
 */
export declare function cliHyperlink(url: string, displayText?: string): string;

/**
 * A styled code block with syntax highlighting.  On the client, the code is
 * highlighted using [Shikiji](https://github.com/antfu/shikiji) using the
 * {@link highlight} util unless the `ssr` prop is set to true and the highlighted
 * text is provided as the `highlightedText` prop.  The raw `text` prop is still
 * required in this case, as it's used for screen readers and the copy button.
 *
 * @example CSR
 *
 * A simple browser example:
 *
 * ```svelte
 * <script>
 * 	import Code from 'fractils'
 *
 * 	const text = `console.log('hello world')`
 * </script>
 *
 * <Code {text} />
 * ```
 *
 * @example SSR
 *
 * ```svelte +page.svelte
 * <script>
 * 	import Code from 'fractils'
 *
 * 	export let data
 * 	const { text, highlightedText } = data
 * </script>
 *
 * <Code ssr {text} {highlightedText} />
 * ```
 *
 * ```typescript +page.ts
 * import { highlight } from 'fractils/utils/highlight'
 *
 * export async function load({ page, fetch }) {
 * 	const text = `console.log('hello world')`
 * 	const highlightedText = await highlight(text, { lang: 'js' })
 *
 * 	return {
 * 		text,
 * 		highlightedText,
 * 	}
 * }
 * ```
 */
export declare class Code extends SvelteComponent<CodeProps, CodeEvents, CodeSlots> {
}

declare type CodeEvents = typeof __propDef_10.events;

declare type CodeProps = typeof __propDef_10.props;

declare type CodeSlots = typeof __propDef_10.slots;

/**
 * Attempts to parse a string value to a boolean or number if
 * possible, returning the string unchanged if not.
 *
 * @example
 * ```ts
 * const a = coerce('21') //=\> const a: number
 * const b = coerce('true') //=\> const b: true
 * const c = coerce('False') //=\> const c: "False"
 * ```
 */
export declare function coerce<T extends string>(value: T): CoerceValue<T>;

/**
 * Takes an object with string values, returning a new object with the
 * values coerced to booleans or numbers where possible. Non-string
 * properties are left unchanged.
 */
export declare function coerceObject<const T extends Record<string, any>>(obj: T): {
    [P in keyof T]: CoerceValue<Extract<T[P], string>>;
};

/**
 * A conditional type that coerces a string literal to a boolean or number type if it matches
 * a recognized pattern, or leaves it as a string otherwise.
 */
export declare type CoerceValue<T extends string> = T extends 'true' ? true : T extends 'false' ? false : T extends `${number}` ? number : T;

/**
 * All valid CSS color names.
 */
export declare const colors: readonly ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGrey", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "DarkOrange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkSlateGrey", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DimGrey", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray", "Grey", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGrey", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSlateGrey", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "RebeccaPurple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "SlateGrey", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen"];

/** @typedef {typeof __propDef.props}  CopyProps */
/** @typedef {typeof __propDef.events}  CopyEvents */
/** @typedef {typeof __propDef.slots}  CopySlots */
export declare class Copy extends SvelteComponent<{
    [x: string]: never;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}

export declare function create(tagnameOrElement: string | HTMLElement, options: {
    parent?: HTMLElement;
    classes?: string[];
    id?: string;
    dataset?: Record<string, string>;
    textContent?: string;
}, ...children: HTMLElement[]): HTMLElement;

/**
 * All valid CSS color names.
 */
declare type CSSColor = (typeof colors)[number] | Lowercase<(typeof colors)[number]>;

/**
 * Converts a decimal to a power of 10.
 */
export declare function decimalToPow(value: number): number;

export declare const defer: typeof requestIdleCallback | ((fn: () => void) => number);

/**
 * A series of device related stores.
 *
 * @see {@link https://fractils.fractal-hq.com/#Device|Device documentation}
 */
declare class Device extends SvelteComponent<DeviceProps, DeviceEvents, DeviceSlots> {
}
export { Device }
export { Device as Fractils }

declare type DeviceEvents = typeof __propDef.events;

declare type DeviceProps = typeof __propDef.props;

declare type DeviceSlots = typeof __propDef.slots;

/** chalk.dim */
export declare function dim(...args: unknown[]): string;

export declare type Direction = 'up' | 'down' | 'left' | 'right';

declare type DragAxis = 'both' | 'x' | 'y' | 'none';

declare type DragBounds = HTMLElement | Partial<DragBoundsCoords> | 'parent' | 'body' | (string & Record<never, never>);

declare type DragBoundsCoords = {
    /** Number of pixels from left of the document */
    left: number;
    /** Number of pixels from top of the document */
    top: number;
    /** Number of pixels from the right side of document */
    right: number;
    /** Number of pixels from the bottom of the document */
    bottom: number;
};

declare type DragEventData = {
    /** How much element moved from its original position horizontally */
    offsetX: number;
    /** How much element moved from its original position vertically */
    offsetY: number;
    /** The node on which the draggable is applied */
    rootNode: HTMLElement;
    /** The element being dragged */
    currentNode: HTMLElement;
};

declare class Draggable {
    node: HTMLElement;
    private _dragInstance;
    private _options;
    constructor(node: HTMLElement, options?: DragOptions);
    updateOptions(options: DragOptions): void;
    set options(options: DragOptions);
    get options(): DragOptions;
    destroy(): void;
}

declare type DragOptions = {
    /**
     * Optionally limit the drag area
     *
     * Accepts `parent` as prefixed value, and limits it to its parent.
     *
     * Or, you can specify any selector and it will be bound to that.
     *
     * **Note**: We don't check whether the selector is bigger than the node element.
     * You yourself will have to make sure of that, or it may lead to strange behavior
     *
     * Or, finally, you can pass an object of type `{ top: number; right: number; bottom: number; left: number }`.
     * These mimic the css `top`, `right`, `bottom` and `left`, in the sense that `bottom` starts from the bottom of the window, and `right` from right of window.
     * If any of these properties are unspecified, they are assumed to be `0`.
     */
    bounds?: DragBounds;
    /**
     * When to recalculate the dimensions of the `bounds` element.
     *
     * By default, bounds are recomputed only on dragStart. Use this options to change that behavior.
     *
     * @default '{ dragStart: true, drag: false, dragEnd: false }'
     */
    recomputeBounds?: {
        dragStart?: boolean;
        drag?: boolean;
        dragEnd?: boolean;
    };
    /**
     * Axis on which the element can be dragged on. Valid values: `both`, `x`, `y`, `none`.
     *
     * - `both` - Element can move in any direction
     * - `x` - Only horizontal movement possible
     * - `y` - Only vertical movement possible
     * - `none` - No movement at all
     *
     * @default 'both'
     */
    axis?: DragAxis;
    /**
     * If false, uses the new translate property instead of transform: translate(); to move the element around.
     *
     * At present this is true by default, but will be changed to false in a future major version.
     *
     * @default true
     */
    legacyTranslate?: boolean;
    /**
     * If true, uses `translate3d` instead of `translate` to move the element around, and the hardware acceleration kicks in.
     *
     * `true` by default, but can be set to `false` if [blurry text issue](https://developpaper.com/question/why-does-the-use-of-css3-translate3d-result-in-blurred-display/) occur
     *
     * @default true
     */
    gpuAcceleration?: boolean;
    /**
     * Custom transform function. If provided, this function will be used to apply the DOM transformations to the root node to move it.
     * Existing transform logic, including `gpuAcceleration` and `legacyTranslate`, will be ignored.
     *
     * You can return a string to apply to a `transform` property, or not return anything and apply your transformations using `rootNode.style.transform = VALUE`
     *
     * @default undefined
     */
    transform?: ({ offsetX, offsetY, rootNode, }: {
        offsetX: number;
        offsetY: number;
        rootNode: HTMLElement;
    }) => string | undefined | void;
    /**
     * Applies `user-select: none` on `<body />` element when dragging,
     * to prevent the irritating effect where dragging doesn't happen and the text is selected.
     * Applied when dragging starts and removed when it stops.
     *
     * Can be disabled using this option
     *
     * @default true
     */
    applyUserSelectHack?: boolean;
    /**
     * Ignores touch events with more than 1 touch.
     * This helps when you have multiple elements on a canvas where you want to implement
     * pinch-to-zoom behaviour.
     *
     * @default false
     *
     */
    ignoreMultitouch?: boolean;
    /**
     * Disables dragging altogether.
     *
     * @default false
     */
    disabled?: boolean;
    /**
     * Applies a grid on the page to which the element snaps to when dragging, rather than the default continuous grid.
     *
     * `Note`: If you're programmatically creating the grid, do not set it to [0, 0] ever, that will stop drag at all. Set it to `undefined`.
     *
     * @default undefined
     */
    grid?: [number, number];
    /**
     * Control the position manually with your own state
     *
     * By default, the element will be draggable by mouse/finger, and all options will work as default while dragging.
     *
     * But changing the `position` option will also move the draggable around. These parameters are reactive,
     * so using Svelte's reactive variables as values for position will work like a charm.
     *
     *
     * Note: If you set `disabled: true`, you'll still be able to move the draggable through state variables. Only the user interactions won't work
     *
     */
    position?: {
        x: number;
        y: number;
    };
    /**
     * CSS Selector of an element or multiple elements inside the parent node(on which `use:draggable` is applied).
     *
     * Can be an element or elements too. If it is provided, Trying to drag inside the `cancel` element(s) will prevent dragging.
     *
     * @default undefined
     */
    cancel?: string | HTMLElement | HTMLElement[];
    /**
     * CSS Selector of an element or multiple elements inside the parent node(on which `use:draggable` is applied). Can be an element or elements too.
     *
     * If it is provided, Only clicking and dragging on this element will allow the parent to drag, anywhere else on the parent won't work.
     *
     * @default undefined
     */
    handle?: string | HTMLElement | HTMLElement[];
    /**
     * Class to apply on the element on which `use:draggable` is applied.
     * Note that if `handle` is provided, it will still apply class on the element to which this action is applied, **NOT** the handle
     *
     */
    defaultClass?: string;
    /**
     * Class to apply on the element when it is dragging
     *
     * @default 'neodrag-dragging'
     */
    defaultClassDragging?: string;
    /**
     * Class to apply on the element if it has been dragged at least once.
     *
     * @default 'neodrag-dragged'
     */
    defaultClassDragged?: string;
    /**
     * Offsets your element to the position you specify in the very beginning.
     * `x` and `y` should be in pixels
     *
     */
    defaultPosition?: {
        x: number;
        y: number;
    };
    /**
     * Fires when dragging start
     */
    onDragStart?: (data: DragEventData) => void;
    /**
     * Fires when dragging is going on
     */
    onDrag?: (data: DragEventData) => void;
    /**
     * Fires when dragging ends
     */
    onDragEnd?: (data: DragEventData) => void;
};

/**
 * A type-preserving version of `Object.entries`.
 * @param obj - Any object.
 * @returns An array of key-value pairs with their types preserved.
 *
 * @example Immutable
 * ```ts
 * const foo2 = { a: 1, b: '✨' } as const
 * entries(foo2) // (['a', 1] | ['b', '✨'])[]
 * Object.entries(foo2) // [string, 1 | '✨'][]
 * ```
 *
 * @example Mutable
 * ```ts
 * const foo1 = { a: 1, b: '✨' }
 * entries(foo1) // ['a', number] | ['b', string])[]
 * Object.entries(foo1) // [string, string | number][]
 * ```
 */
export declare function entries<T extends {}>(object: T): readonly Entry<T>[];

declare type Entry<T extends {}> = T extends readonly [unknown, ...unknown[]] ? TupleEntry<T> : T extends ReadonlyArray<infer U> ? [`${number}`, U] : ObjectEntry<T>;

declare type Event_2 = 'v-change' | 'v-leave' | 'v-exit' | 'v-enter';
export { Event_2 as Event }

/**
 * Formats a number representing time.  Smaller numbers are formatted in
 * milliseconds, and larger numbers in seconds. In both cases, precision
 * is kept to a minimum and trailing zeroes are removed.
 * @param n - Time in milliseconds.
 * @returns Formatted time string.
 */
export declare function fmtTime(n: number): string;

/**
 * @internal
 */
declare class Folder {
    #private;
    id: string;
    isFolder: true;
    isRoot: boolean;
    root: Folder;
    title: string;
    children: Folder[];
    controls: Map<string, Input>;
    parentFolder: Folder;
    element: HTMLElement;
    headerElement: HTMLElement;
    titleElement: HTMLElement;
    contentElement: HTMLElement;
    closed: {
        set: (value: boolean) => void;
    } & Omit<PrimitiveState<boolean>, "set">;
    log: Logger;
    constructor(options: FolderOptions, rootContainer?: HTMLElement | null);
    disable: () => void;
    reset(): void;
    addFolder(options?: {
        title?: string;
        closed?: boolean;
    }): Folder;
    addInput(options: InputOptions): void;
    isGui(): this is Gui;
    toggle: () => void;
    open(): void;
    close(): void;
    /**
     * A flat array of all children of this folder.
     */
    get allChildren(): any[];
    dispose(): void;
}

/**
 * @internal
 */
declare interface FolderOptions {
    /**
     * The title of the folder.
     * @default ''
     */
    title: string;
    /**
     * The child folders of this folder.
     */
    children: Folder[];
    /**
     * Any controls this folder should contain.
     */
    controls: Map<string, Input>;
    parentFolder: Folder;
    /**
     * Whether the folder should be collapsed by default.
     * @default false
     */
    closed: boolean;
    /**
     * The element to append the folder to (usually
     * the parent folder's content element).
     */
    element?: HTMLElement;
}

/**
 * Gets the font size of the root element (on the
 * server, this will always return `16px`).
 */
export declare const fontSize: `${number}px`;

/** @typedef {typeof __propDef.props}  FroggoProps */
/** @typedef {typeof __propDef.events}  FroggoEvents */
/** @typedef {typeof __propDef.slots}  FroggoSlots */
export declare class Froggo extends SvelteComponent<{
    [x: string]: never;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}

export declare const fullscreen: Action;

declare interface FullscreenOptions_2 {
    button?: HTMLElement;
    size?: number;
    dimTime?: number;
    hideTime?: number;
    fadeDuration?: number;
    debug?: boolean;
}
export { FullscreenOptions_2 as FullscreenOptions }

/** chalk.green */
export declare function g(...args: unknown[]): string;

/**
 * Accepts `rem`, `vw`, and `vh` css units, and returns the
 * corresponding pixel value.
 *
 * @param str A string containing a css unit.
 * @param relativeParentSize The size of the parent element, if the unit is `%`.
 *
 * @throws If the string is not a valid css unit.
 *
 * @example
 * ```ts
 * measure('1rem') // 16
 * measure('100vw') // 1920 (on a 1920x1080 screen)
 * ```
 */
export declare function getPx(str: `${number}${'px' | 'rem' | 'vw' | 'vh' | '%'}`, relativeParentSize?: number): number;

/** @typedef {typeof __propDef.props}  GithubProps */
/** @typedef {typeof __propDef.events}  GithubEvents */
/** @typedef {typeof __propDef.slots}  GithubSlots */
export declare class Github extends SvelteComponent<{
    [x: string]: never;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}

/**
 * The root Gui instance.  This is the entry point for creating
 * a gui.  You can create multiple root guis, but each gui
 * can only have one root.
 */
declare class Gui extends Folder {
    isRoot: true;
    container: HTMLElement;
    themer?: Themer;
    resizable?: Resizable_2;
    draggable?: Draggable;
    closed: PrimitiveState<boolean>;
    size: PrimitiveState<{
        width: number;
        height: number;
    }>;
    position: PrimitiveState<{
        x: number;
        y: number;
    }>;
    /**
     * Which state properties to persist to localStorage.
     */
    storage: StorageOptions | Record<string, any>;
    log: Logger;
    constructor(options?: Partial<GuiOptions>);
    dispose(): void;
}

declare const GUI_DEFAULTS: {
    readonly title: "Controls";
    readonly controls: Map<any, any>;
    readonly children: [];
    readonly themer: true;
    readonly themerOptions: {};
    readonly resizable: true;
    readonly draggable: true;
    readonly storage: {
        readonly key: "fractils::gui";
        readonly size: true;
        readonly position: true;
        readonly closed: true;
        readonly debounce: 50;
    };
    readonly closed: false;
    readonly size: {
        readonly width: 0;
        readonly height: 0;
    };
    readonly position: {
        readonly x: 16;
        readonly y: 16;
    };
};

declare type GuiEvents = typeof __propDef_11.events;

declare interface GuiOptions extends FolderOptions {
    /**
     * Persist the gui's state to localStorage by specifying the key
     * to save the state under.
     * @default undefined
     */
    storage?: true | {
        /**
         * @default "fractils::gui"
         */
        key: string;
        /**
         * @default true
         */
        size?: boolean;
        /**
         * @default true
         */
        position?: boolean;
        /**
         * @default true
         */
        closed?: boolean;
        /**
         * How long to debounce writes to localStorage (0 to disable).
         * @default 50
         */
        debounce?: number;
    };
    /**
     * The container to append the gui to.
     * @default document.body
     */
    container?: HTMLElement;
    /**
     * Optional {@link Themer} instance for syncing the gui's theme
     * with your app's theme.  If `true`, a new themer will be created
     * for you. If `false` or `undefined`, no themer will be created.
     * @default true
     */
    themer: Themer | boolean;
    /**
     * Options for the {@link Themer} instance when `themer` is `true`.
     */
    themerOptions: Partial<ThemerOptions>;
    /**
     * Whether the gui should be resizable.  Can be a boolean, or
     * your own {@link ResizableOptions}.  If `false` or `undefined`,
     * the gui will not be resizable.
     */
    resizable: boolean | ResizableOptions;
    /**
     * Whether the gui should be draggable.  Can be a boolean, or
     * your own {@link DragOptions}.  If `false` or `undefined`,
     * the gui will not be resizable.
     */
    draggable: boolean | DragOptions;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    closed: boolean;
}

declare type GuiProps = typeof __propDef_11.props;

declare type GuiSlots = typeof __propDef_11.slots;

/**
 * Converts a hex color string to an array of rgb values.
 * @param hex - A css hex color string, i.e. `#fff` or `#ffffff`
 */
export declare function hexToRgb(hex: string): string;

/**
 * Converts text to HTML with syntax highlighting using shikiji.
 */
export declare function highlight(text: string, options?: Partial<HighlightOptions>): Promise<string>;

export declare const HIGHLIGHT_DEFAULTS: HighlightOptions;

export declare interface HighlightAttr {
    'on:highlight'?: (event: HighlightEvent) => void;
}

/**
 * A syntax highlighter action.
 * @example
 * ```svelte
 * <pre use:highlight={{ lang: 'json' }}>
 * 	{JSON.stringify({ hello: 'world' }, null, 2)}
 * </pre>
 * ```
 */
export declare const highlighter: Action<HTMLElement, HighlightOptions, HighlightAttr>;

export declare type HighlightEvent = CustomEvent<HighlightEventDetail>;

export declare interface HighlightEventDetail {
    /**
     * The element that was highlighted.
     */
    target: HTMLElement;
    /**
     * The highlighted text.
     */
    text: string;
}

export declare type HighlightOptions = CodeToHastOptions<Lang, Theme> & {
    /**
     * The language to highlight.
     * @defaultValue 'svelte'
     */
    lang: Lang;
    /**
     * The language to highlight.
     * @defaultValue 'javascript'
     */
    theme: Theme | 'serendipity';
};

/** chalk.italic */
export declare function i(...args: unknown[]): string;

/**
 * Applies system preference theme and registers a listener for changes.
 */
export declare function initTheme(): Promise<void>;

declare class Input<T = InputType, V = InputValue<T>> {
    #private;
    state: State<V>;
    title: string;
    type: string;
    folder: Folder;
    element: HTMLElement;
    constructor(options: InputOptions<T, V>);
}

declare interface InputOptions<T = InputType, V = InputValue<T>> {
    value: V;
    title: string;
    type: string;
    folder: Folder;
}

declare type InputType = 'Text' | 'Number' | 'Boolean' | 'Color' | 'Range' | 'Select' | 'Button' | 'Folder' | 'Textarea';

declare type InputValue<T = InputType> = T extends 'Text' ? string : T extends 'Number' ? number : T extends 'Boolean' ? boolean : T extends 'Color' ? string : T extends 'Range' ? number : T extends 'Select' ? string : T extends 'Button' ? void : T extends 'Folder' ? Folder : T extends 'Textarea' ? string : never;

export declare class Inspector extends SvelteComponent<InspectorProps, InspectorEvents, InspectorSlots> {
}

declare type InspectorEvents = typeof __propDef_2.events;

declare type InspectorProps = typeof __propDef_2.props;

declare type InspectorSlots = typeof __propDef_2.slots;

export declare function isDefined<T>(value: T | undefined): value is T;

export declare function isMouseEvent(e: Event): e is PointerEvent;

export declare function isString(value: unknown): value is string;

export declare function isTouchEvent(e: Event): e is TouchEvent;

declare type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

/** JSON.Stringify */
export declare function j(o: unknown): string;

/**
 * A type-preserving version of `Object.keys`.
 * @param obj - Any object.
 * @returns An array of the keys with their types preserved.
 *
 * @example Immutable
 * ```ts
 * const foo2 = { a: 1, b: '✨' } as const
 * keys(foo2) // ('a' | 'b')[]
 * Object.keys(foo2) // string[]
 * ```
 *
 * @example Mutable
 * ```ts
 * const foo1 = { a: 1, b: '✨' }
 * keys(foo1) // readonly ('a' | 'b')[]
 * Object.keys(foo1) // string[]
 * ```
 */
export declare function keys<T extends {}>(object: T): ReadonlyArray<keyof T>;

/** console.log */
export declare function l(...args: unknown[]): void;

/** lightGreen chalk.hex('#aea') */
export declare function lg(...args: unknown[]): string;

/**
 * A Svelte store that uses localStorage to store data asyncronously.
 * It supports debouncing and deferring localStorage updates, and
 * syncronizes with localStorage events across tabs.
 * @param key - The key to store the data under.
 * @param initial - The initial value of the store.
 * @param options - {@link StateOptions}
 * @example
 * ```ts
 * const store = localStorageStore('foo', 5)
 * ```
 */
export declare const localStorageStore: <T>(key: string, initial: T, options?: StateOptions<T> | undefined) => Writable<T>;

/**
 * A simple logger that only runs in dev environments.
 * @param msg - A string or object to log
 * @param color - Any CSS color value ( named | hex | rgb | hsl )
 * @param bgColor - Same as color ⇧
 * @param fontSize - Any number
 * @param css - Optional additional CSS
 */
export declare const log: (msg: string | any, color?: string, bgColor?: string, fontSize?: number, css?: string) => void;

declare class Logger {
    title: string;
    options?: {
        /**
         * Whether to use the styled logger or the regular console.log.
         * @defaultValue true
         */
        styled?: boolean | undefined;
        /**
         * Whether to defer the log to the next idle state.  Disabled on Safari to avoid crashing.
         * @defaultValue true
         */
        deferred?: boolean | undefined;
        /**
         * The foreground color of the log.
         * @defaultValue randomColor()
         */
        fg?: CSSColor | (string & {}) | undefined;
        /**
         * The background color of the log.
         * @defaultValue transparent
         */
        bg?: CSSColor | (string & {}) | undefined;
        /**
         * Any additional CSS to apply to the log.
         * @defaultValue ''
         */
        css?: string | undefined;
        /**
         * Run the logger on the server.
         * @defaultValue false
         */
        server?: boolean | undefined;
        /**
         * Run the logger in the browser.
         * @defaultValue true
         */
        browser?: boolean | undefined;
        /**
         * Print's the url of the file that called the logger.
         */
        callsite?: boolean | undefined;
    } | undefined;
    log: ReturnType<typeof logger>;
    constructor(title: string, options?: {
        /**
         * Whether to use the styled logger or the regular console.log.
         * @defaultValue true
         */
        styled?: boolean | undefined;
        /**
         * Whether to defer the log to the next idle state.  Disabled on Safari to avoid crashing.
         * @defaultValue true
         */
        deferred?: boolean | undefined;
        /**
         * The foreground color of the log.
         * @defaultValue randomColor()
         */
        fg?: CSSColor | (string & {}) | undefined;
        /**
         * The background color of the log.
         * @defaultValue transparent
         */
        bg?: CSSColor | (string & {}) | undefined;
        /**
         * Any additional CSS to apply to the log.
         * @defaultValue ''
         */
        css?: string | undefined;
        /**
         * Run the logger on the server.
         * @defaultValue false
         */
        server?: boolean | undefined;
        /**
         * Run the logger in the browser.
         * @defaultValue true
         */
        browser?: boolean | undefined;
        /**
         * Print's the url of the file that called the logger.
         */
        callsite?: boolean | undefined;
    } | undefined);
    l(prefix: string, ...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    buffer: any[];
    fn(str: string): this;
}

declare const logger: (title?: string, options?: {
    /**
     * Whether to use the styled logger or the regular console.log.
     * @defaultValue true
     */
    styled?: boolean;
    /**
     * Whether to defer the log to the next idle state.  Disabled on Safari to avoid crashing.
     * @defaultValue true
     */
    deferred?: boolean;
    /**
     * The foreground color of the log.
     * @defaultValue randomColor()
     */
    fg?: CSSColor | (string & {});
    /**
     * The background color of the log.
     * @defaultValue transparent
     */
    bg?: CSSColor | (string & {});
    /**
     * Any additional CSS to apply to the log.
     * @defaultValue ''
     */
    css?: string;
    /**
     * Run the logger on the server.
     * @defaultValue false
     */
    server?: boolean;
    /**
     * Run the logger in the browser.
     * @defaultValue true
     */
    browser?: boolean;
    /**
     * Print's the url of the file that called the logger.
     */
    callsite?: boolean;
}) => (...args: any[]) => void;

/** chalk.magenta */
export declare function m(...args: unknown[]): string;

/**
 * Turns the scrollbar into a macOS-like scrollbar that only appears when scrolling (or when the user hovers over it).
 * It aims to be fully functional and accessible.
 */
export declare class MacScrollbar extends SvelteComponent<MacScrollbarProps, MacScrollbarEvents, MacScrollbarSlots> {
    get padding(): number;
}

declare type MacScrollbarEvents = typeof __propDef_3.events;

declare type MacScrollbarProps = typeof __propDef_3.props;

declare type MacScrollbarSlots = typeof __propDef_3.slots;

/**
 * Converts an array of args to a Map of key-value pairs.
 * @param args - The array of arguments to convert.
 * @param coerce - Whether to coerce numbers and booleans, or leave them as strings.  Defaults to true.
 * @remarks
 * - Arguments starting with -- support spaces and `=` as a separator, e.g. `--name=John` or `--name John`
 * - Arguments starting with - support k/v with spaces, e.g. `-n John` or boolean flags, e.g. `-n`
 * - Arguments without a leading - or -- are treated as positional arguments and ignored.
 */
export declare function mapArgs(args: string[], coerce?: boolean): Map<string, string | number | boolean>;

/**
 *  Maps a value from one range to another
 *
 * @param value - the value to map
 * @param x1 - lower bound of the input range
 * @param x2 - upper bound of the input range
 * @param y1 - lower bound of the output range
 * @param y2 - upper bound of the output range
 * @returns a number mapped from the input range to the output range
 */
export declare const mapRange: (value: number, x1: number, x2: number, y1: number, y2: number) => number;

declare interface MapState<K, V> extends PrimitiveState<Map<K, V>> {
    /**
     * Set value and inform subscribers.
     *
     * Note: To update a map, use the `setKey` and `deleteKey` methods.
     */
    set: (value: Map<K, V>) => void;
    setKey: (key: K, value: V) => void;
    deleteKey: (key: K) => void;
}

/**
 * Detects screen width below 900px
 * @default false
 */
export declare const mobile: Readable<boolean>;

/**
 * Adjusts the $mobile 'breakpoint' threshold.
 * @default 900
 */
export declare const mobileThreshold: Writable<number>;

/**
 * Tracks the users x and y mouse positions.
 */
export declare const mouse: Writable<    {
x: number;
y: number;
}>;

/**
 * Logs an empty line.
 */
export declare function n(
/**
 * Number of empty lines to log.
 * @default 1
 */
count?: number): void;

export declare function o(...args: unknown[]): string;

/**
 * Maps an object literal to a union of literal entry pairs.
 * @typeParam T - The object type being processed.
 * @internal
 */
declare type ObjectEntry<T extends {}> = T extends object ? {
    [K in keyof T]: [K, Required<T>[K]];
}[keyof T] extends infer E ? E extends [infer K, infer V] ? K extends string | number ? [`${K}`, V] : never : never : never : never;

/** @typedef {typeof __propDef.props}  OnMountProps */
/** @typedef {typeof __propDef.events}  OnMountEvents */
/** @typedef {typeof __propDef.slots}  OnMountSlots */
/** Mounts a component when the DOM is ready.  Useful for intro animations. */
export declare class OnMount extends SvelteComponent<{
    [x: string]: never;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}

/** pink chalk.hex('#eaa') */
export declare function p(...args: unknown[]): string;

/**
 * Partitions an array into two arrays based on a predicate.  The second argument
 * is a callback that takes an element from the array and returns a boolean.
 * - If it returns true, the element will be placed in the first array.
 * - If it returns false, the element will be placed in the second array.
 *
 * @example
 * ```ts
 * const [even, odd] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0)
 *
 * console.log(even) // [2, 4]
 * console.log(odd) // [1, 3, 5]
 * ```
 */
export declare function partition<const T>(array: T[], predicate: (element: T) => boolean): [T[], T[]];

export declare type Position = {
    x?: number;
    y?: number;
};

declare interface PrimitiveState<T> extends Writable<T> {
    get(): T;
    readonly value: T;
    onChange: (cb: (v: T) => void) => void;
}

/** chalk.red */
export declare function r(...args: unknown[]): string;

export declare const randomColor: () => "AliceBlue" | "AntiqueWhite" | "Aqua" | "Aquamarine" | "Azure" | "Beige" | "Bisque" | "Black" | "BlanchedAlmond" | "Blue" | "BlueViolet" | "Brown" | "BurlyWood" | "CadetBlue" | "Chartreuse" | "Chocolate" | "Coral" | "CornflowerBlue" | "Cornsilk" | "Crimson" | "Cyan" | "DarkBlue" | "DarkCyan" | "DarkGoldenRod" | "DarkGray" | "DarkGrey" | "DarkGreen" | "DarkKhaki" | "DarkMagenta" | "DarkOliveGreen" | "DarkOrange" | "DarkOrchid" | "DarkRed" | "DarkSalmon" | "DarkSeaGreen" | "DarkSlateBlue" | "DarkSlateGray" | "DarkSlateGrey" | "DarkTurquoise" | "DarkViolet" | "DeepPink" | "DeepSkyBlue" | "DimGray" | "DimGrey" | "DodgerBlue" | "FireBrick" | "FloralWhite" | "ForestGreen" | "Fuchsia" | "Gainsboro" | "GhostWhite" | "Gold" | "GoldenRod" | "Gray" | "Grey" | "Green" | "GreenYellow" | "HoneyDew" | "HotPink" | "IndianRed" | "Indigo" | "Ivory" | "Khaki" | "Lavender" | "LavenderBlush" | "LawnGreen" | "LemonChiffon" | "LightBlue" | "LightCoral" | "LightCyan" | "LightGoldenRodYellow" | "LightGray" | "LightGrey" | "LightGreen" | "LightPink" | "LightSalmon" | "LightSeaGreen" | "LightSkyBlue" | "LightSlateGray" | "LightSlateGrey" | "LightSteelBlue" | "LightYellow" | "Lime" | "LimeGreen" | "Linen" | "Magenta" | "Maroon" | "MediumAquaMarine" | "MediumBlue" | "MediumOrchid" | "MediumPurple" | "MediumSeaGreen" | "MediumSlateBlue" | "MediumSpringGreen" | "MediumTurquoise" | "MediumVioletRed" | "MidnightBlue" | "MintCream" | "MistyRose" | "Moccasin" | "NavajoWhite" | "Navy" | "OldLace" | "Olive" | "OliveDrab" | "Orange" | "OrangeRed" | "Orchid" | "PaleGoldenRod" | "PaleGreen" | "PaleTurquoise" | "PaleVioletRed" | "PapayaWhip" | "PeachPuff" | "Peru" | "Pink" | "Plum" | "PowderBlue" | "Purple" | "RebeccaPurple" | "Red" | "RosyBrown" | "RoyalBlue" | "SaddleBrown" | "Salmon" | "SandyBrown" | "SeaGreen" | "SeaShell" | "Sienna" | "Silver" | "SkyBlue" | "SlateBlue" | "SlateGray" | "SlateGrey" | "Snow" | "SpringGreen" | "SteelBlue" | "Tan" | "Teal" | "Thistle" | "Tomato" | "Turquoise" | "Violet" | "Wheat" | "White" | "WhiteSmoke" | "Yellow" | "YellowGreen";

/** A custom range input slider component. */
declare class Range_2 extends SvelteComponent<RangeProps, RangeEvents, RangeSlots> {
}
export { Range_2 as Range }

declare type RangeEvents = typeof __propDef_9.events;

declare type RangeProps = typeof __propDef_9.props;

declare type RangeSlots = typeof __propDef_9.slots;

export declare class Resizable extends SvelteComponent<ResizableProps, ResizableEvents_2, ResizableSlots> {
}

/**
 * Svelte-action version of {@link Resizable}.
 *
 * @example Basic
 * ```svelte
 * <div use:resize> Resize Me </div>
 * ```
 *
 * @example Advanced
 * ```svelte
 * <script>
 * 	import { resize } from 'fractils'
 * </script>
 *
 * <div use:resize={{
 * 	sides: ['left', 'bottom'],
 * 	grabberSize: 3,
 * 	onResize: () => console.log('resized'),
 * 	localStorageKey: 'resizable::size',
 * 	visible: false,
 * 	color: 'var(--fg-d)',
 * 	borderRadius: '0.5rem',
 * }} />
 * ```
 */
export declare const resizable: Action<HTMLElement, ResizableOptions, ResizableEvents>;

/**
 * Makes an element resizable by dragging its edges.  For the
 * svelte-action version, see {@link resizable}.
 *
 * @param node - The element to make resizable.
 * @param options - {@link ResizableOptions}
 *
 * @example Basic
 * ```ts
 * import { Resizable } from 'fractils'
 *
 * const node = document.createElement('div')
 * new Resizable(node)
 * ```
 *
 * @example Advanced
 * ```ts
 * import { Resizable } from 'fractils'
 *
 * const node = document.createElement('div')
 * new Resizable(node, {
 * 	sides: ['left', 'bottom'],
 * 	grabberSize: 3,
 * 	onResize: () => console.log('resized'),
 * 	localStorageKey: 'resizableL::size',
 * 	visible: false,
 * 	color: 'var(--fg-d)',
 * 	borderRadius: '0.5rem',
 * })
 * ```
 */
declare class Resizable_2 implements Omit<ResizableOptions, 'size'> {
    #private;
    node: HTMLElement;
    static initialized: boolean;
    sides: Side[];
    color: string;
    visible: boolean;
    borderRadius: string;
    grabberSize: string | number;
    onResize: (size: {
        width: number;
        height: number;
    }) => void;
    size: State<{
        width: number;
        height: number;
    }>;
    localStorageKey?: string;
    constructor(node: HTMLElement, options: ResizableOptions);
    saveSize: (...args: any[]) => void;
    createGrabbers(): void;
    onMouseOver: (e: MouseEvent) => void;
    onGrab: (e: MouseEvent) => void;
    /**
     * This is where all the resizing logic happens.
     */
    onMove: (e: MouseEvent) => void;
    onUp: () => void;
    generateGlobalCSS(): void;
    destroy(): void;
}

export declare interface ResizableEvents {
    /**
     * Dispatched when the element is resized.
     */
    'on:resize'?: (event: CustomEvent) => void;
}

declare type ResizableEvents_2 = typeof __propDef_5.events;

/**
 * Options for the {@link resizable} action.
 */
export declare interface ResizableOptions {
    /**
     * To only allow resizing on certain sides, specify them here.
     * @default ['top', 'right', 'bottom', 'left']
     */
    sides?: Side[];
    /**
     * The size of the resize handle in pixels.
     * @default 3
     */
    grabberSize?: number | string;
    /**
     * Optional callback function that runs when the element is resized.
     * @default () => void
     */
    onResize?: (size: {
        width: number;
        height: number;
    }) => void;
    /**
     * If provided, the size of the element will be persisted
     * to local storage under the specified key.
     * @default undefined
     */
    localStorageKey?: string;
    /**
     * Use a visible or invisible gutter.
     * @default false
     */
    visible?: boolean;
    /**
     * Gutter css color (if visible = `true`)
     * @default 'var(--fg-d, #1d1d1d)'
     */
    color?: string;
    /**
     * Border radius of the element.
     * @default '0.5rem'
     */
    borderRadius?: string;
}

declare type ResizableProps = typeof __propDef_5.props;

declare type ResizableSlots = typeof __propDef_5.slots;

/**
 * Get the value of a command line argument by name from an array of arguments.
 */
export declare function resolveArg(name: string, args: string[]): string | true | undefined;

/**
 * Converts an array of rgb values to a css hex color string.
 */
export declare function rgbToHex(r: number, g: number, b: number): string;

export declare class Root extends SvelteComponent<GuiProps, GuiEvents, GuiSlots> {
}

/**
 * Tracks the screen height.
 * @default 900
 */
export declare const screenH: Writable<number>;

/**
 * Tracks the screen width.
 * @default 900
 */
export declare const screenW: Writable<number>;

export declare type ScrollDirection = {
    vertical?: Direction;
    horizontal?: Direction;
};

/**
 * Tracks the users scroll position.
 * @default 0
 */
declare const scrollY_2: Writable<number>;
export { scrollY_2 as scrollY }

export declare class Select<V> extends SvelteComponent<SelectProps<V>, SelectEvents<V>, SelectSlots<V>> {
}

declare type SelectEvents<V> = ReturnType<__sveltets_Render<V>['events']>;

declare type SelectProps<V> = ReturnType<__sveltets_Render<V>['props']>;

declare type SelectSlots<V> = ReturnType<__sveltets_Render<V>['slots']>;

/**
 * Replaces circular references, undefined values, and functions with strings.
 * - Circular references are replaced with the string `[Circular ~<path>]`
 * where `<path>` is the path to the circular reference relative to the
 * root object, i.e. `[Circular ~.b.c]`.
 * - `undefined` values are replaced with the string `"undefined"`.
 * - Functions are replaced with the string `"function"`.
 *
 * @returns A replacer function for JSON.stringify.
 */
export declare function serialize(): (this: unknown, key: string, value: unknown) => unknown;

declare interface SetState<T> extends PrimitiveState<Set<T>> {
    add: (item: T) => void;
    delete: (item: T) => void;
}

/**
 * The sides of an element that can be resized by the {@link resizable} action.
 */
export declare type Side = 'top' | 'right' | 'bottom' | 'left';

/** @typedef {typeof __propDef.props}  SocketProps */
/** @typedef {typeof __propDef.events}  SocketEvents */
/** @typedef {typeof __propDef.slots}  SocketSlots */
/**
 * @internal
 *
 * A generic wrapper around a control to ease integration with the
 * {@link Root} component.
 *
 * @see [Root](/gui/Root)
 */
export declare class Socket extends SvelteComponent<{
    [x: string]: never;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}

/**
 * Like `console.time`, returning a `console.timeEnd` function.
 * @param label - Console label.
 * @returns `console.timeEnd` for the given label.
 * @example
 * ```ts
 * const end = start('foo')
 * // do stuff
 * end() // foo 1.2s
 * ```
 */
export declare function start(label: string, options?: StartOptions): () => void;

/**
 * Options for `start`.
 */
export declare interface StartOptions {
    /**
     * Whether to use a random color for the label.
     * @default true
     */
    randomColor?: boolean;
    /**
     * Whether to pad the label with newlines.
     * @default true
     */
    pad?: boolean;
    /**
     * Whether to log at creation.
     * @default true
     */
    logStart?: boolean;
    /**
     * Symbol shown before all labels.
     * @default '▶︎'
     */
    symbol?: string;
    /**
     * Symbol to use at the start of the label.
     * @default '⏹'
     */
    startSymbol?: string;
    /**
     * Symbol to use at the end of the label.
     * @default '⏹'
     */
    endSymbol?: string;
}

declare type State<T> = IsUnion<T> extends true ? UnionState<T> : T extends Array<infer U> ? ArrayState<U> : T extends Map<infer K, infer V> ? MapState<K, V> : T extends Set<infer U> ? SetState<U> : PrimitiveState<T>;

declare interface StateOptions<T> extends Partial<Writable<T>> {
    /**
     * If provided, localStorage updates will be debounced by
     * the specified number of milliseconds. If both `debounce`
     * and `throttle` are provided, `debounce` will take precedence.
     * @default undefined
     */
    debounce?: number;
    /**
     * If true, localStorage updates will be deferred using
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback | requestIdleCallback},
     * falling back to `requestAnimationFrame` and finally `setTimeout` with
     * a timeout of 0. Particularly useful in hot code paths like render loops.
     * @remarks
     * Deferring can significantly reduce the performance impact of many
     * syncronous localStorage updates (which run on the main thread).
     * At the time of writing, `requestIdleCallback` is still in
     * Safari Technology Preview, hence the fallbacks.
     * @default false
     */
    defer?: boolean;
    /**
     * Optional callback function that runs after the store is
     * updated and all subscribers have been notified.
     * @default undefined
     */
    onChange?: (v: T) => void;
}

declare type StorageOptions = typeof GUI_DEFAULTS.storage;

/**
 * JSON.stringify() with circular reference support.
 * - Circular references are replaced with the string `[Circular ~<path>]`
 * where `<path>` is the path to the circular reference.
 * - `undefined` -\> `"undefined"`
 * - `function` -\> `"function"`
 *
 * @param obj - The object to stringify.
 * @param indentation - Number of spaces for indentation. Optional.
 */
export declare const stringify: (input: unknown, indentation?: number) => string;

/**
 * A native checkbox that looks like a switch.
 *
 * @remarks The switch is designed to have a fixed size for consistency. It's best placed within a passive container that softly wraps the input, such as one with a width set to 'fit-content'. If the switch is placed in a parent container that's too small, adjust the size of the switch using the `--switch-width` and `--switch-height` custom properties, or adjust the size of the parent container. The switch does not automatically adjust its size based on the parent container.
 *
 * @example Basic
 * ```html
 * <script>
 * 	import Switch from './Switch.svelte'
 *
 * 	let checked = false
 * 	$: console.log(checked ? 'on' : 'off')
 * </script>
 *
 * <Switch bind:checked />
 * ```
 *
 * @example Theme Switcher
 * ```html
 * <script>
 * 	import { theme, toggleTheme } from 'fractils'
 * 	import Switch from './Switch.svelte'
 * </script>
 *
 * <Switch
 * 	on="🌞"
 * 	off="🌙"
 * 	title="theme switcher"
 * 	checked={$theme === 'dark'}
 * 	on:click={toggleTheme}
 * 	--switch-accent="var(--bg-d)"
 * />
 * ```
 */
export declare class Switch extends SvelteComponent<SwitchProps, SwitchEvents, SwitchSlots> {
}

declare type SwitchEvents = typeof __propDef_8.events;

declare type SwitchProps = typeof __propDef_8.props;

declare type SwitchSlots = typeof __propDef_8.slots;

/**
 * A store for the current theme persisted in local storage.
 */
export declare const theme: {
    set: (value: Theme_2) => void;
} & Omit<PrimitiveState<Theme_2>, "set">;

declare type Theme_2 = 'light' | 'dark' | 'system';

/**
 * Represents a theme configuration.
 */
declare interface ThemeConfig {
    title: ThemeTitle;
    dark: ThemeVariantConfig;
    light: ThemeVariantConfig;
}

declare type ThemeMode = ThemeVariant | 'system';

/**
 * The Themer class manages multiple customizable application themes.
 * It can be used to store and retrieve themes, create new themes,
 * and apply themes to the document.  Each theme has a light and dark
 * variant, and the active variant is determined by the current
 * {@link ThemeMode}, which can be set to 'light', 'dark', or 'system'.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * 	import { Themer } from 'fractils'
 * 	import my_theme from './themes/my_theme.json'
 *
 * 	const themer = new Themer({
 * 		theme: my_theme,
 * 	})
 * </script>
 *
 * <h1>{theme.theme.title}</h1>
 * <button on:click={() => themer.mode = 'dark'}>dark mode</button>
 * <button on:click={() => themer.addTheme({...})}>add theme</button>
 */
export declare class Themer {
    #private;
    theme: State<ThemeConfig>;
    mode: State<'light' | 'dark' | 'system'>;
    themes: State<ThemeConfig[]>;
    log: (...args: any[]) => void;
    constructor(options?: Partial<ThemerOptions>);
    init(): this | undefined;
    /**
     * The current mode, taking into account the system preferences.
     */
    get activeMode(): 'light' | 'dark';
    /**
     * Adds a new theme to the Themer and optionally saves it to localStorage.
     */
    create(
    /**
     * The theme to add.
     * @remarks If a theme with the same title already exists, its title
     * will be incremented with a number suffix (i.e. `my-theme (1)`).
     */
    newTheme: ThemeConfig, options?: {
        /**
         * Whether to overwrite an existing theme with the same title,
         * or increment the title with a number suffix.
         * @default false
         */
        overwrite?: boolean;
        /**
         * Whether to re-save the Themer state to localStorage
         * after adding the new theme.  If {@link ThemerOptions.persistent}
         * is `false`, this option is ignored.
         * @default true
         */
        save?: boolean;
    }): this;
    delete(themeOrTitle: ThemeTitle | ThemeConfig): this;
    /**
     * Resolves a {@link ThemeConfig} by title.
     */
    getThemeConfig(themeTitle: ThemeTitle): ThemeConfig | undefined;
    /**
     * Applies the current theme to the document.
     */
    applyTheme(): this | undefined;
    /**
     * Updates Themer state from JSON.
     */
    fromJSON(json: ThemerJSON): void;
    /**
     * Serializes the current Themer state to JSON.
     */
    toJSON(): {
        themes: ThemeConfig[];
        activeTheme: ThemeTitle;
        mode: "light" | "dark" | "system";
    };
    /**
     * Loads Themer state from localStorage.
     * @returns The JSON that was loaded (if found).
     */
    load(): this;
    /**
     * Saves the current Themer state to localStorage.
     * @returns The JSON that was saved.
     */
    save(): {
        themes: ThemeConfig[];
        activeTheme: ThemeTitle;
        mode: "light" | "dark" | "system";
    } | undefined;
    /**
     * Removes the current Themer state from localStorage.
     */
    clear(): void;
    dispose(): void;
}

export declare class ThemerComponent extends SvelteComponent<ThemerProps, ThemerEvents, ThemerSlots> {
}

declare type ThemerEvents = typeof __propDef_12.events;

/**
 * A JSON representation of the {@link Themer} class. Used in the
 * {@link Themer.toJSON | toJSON()} and {@link Themer.fromJSON | fromJSON()},
 * methods, and subsequently, in {@link Themer.save | save()}
 * and {@link Themer.load | load()}.
 */
declare interface ThemerJSON {
    themes: ThemeConfig[];
    activeTheme: ThemeTitle;
    mode: ThemeMode;
}

/**
 * Options for the {@link Themer} class.
 */
declare interface ThemerOptions {
    /**
     * Whether to automatically initialize the theme.
     * @default true
     */
    autoInit: boolean;
    /**
     * Whether to persist the Themer state in localStorage.
     * @default true
     */
    persistent: boolean;
    /**
     * The default theme to use.
     * @default A theme titled 'default'.
     */
    theme: ThemeConfig;
    themes: Array<ThemeConfig>;
    mode: ThemeMode;
}

declare type ThemerProps = typeof __propDef_12.props;

declare type ThemerSlots = typeof __propDef_12.slots;

declare type ThemeTitle = 'theme-default' | 'theme-a' | 'theme-b' | 'theme-c' | (string & {});

/** A theme toggle button with slots for light and dark mode icons. */
export declare class ThemeToggle extends SvelteComponent<ThemeToggleProps, ThemeToggleEvents, ThemeToggleSlots> {
}

declare type ThemeToggleEvents = typeof __propDef_4.events;

declare type ThemeToggleProps = typeof __propDef_4.props;

declare type ThemeToggleSlots = typeof __propDef_4.slots;

declare type ThemeVariant = 'light' | 'dark';

/**
 * A theme variant config contains hex colors. All {@link ThemeConfig | ThemeConfigs}
 * contain both a light and dark variant, defined here.
 */
declare interface ThemeVariantConfig {
    'brand-a': string;
    'brand-b': string;
    'brand-c': string;
    'fg-a': string;
    'fg-b': string;
    'fg-c': string;
    'fg-d': string;
    'bg-a': string;
    'bg-b': string;
    'bg-c': string;
    'bg-d': string;
}

/**
 * Short timestamp.
 * @param length - Timestamp character length.
 */
export declare function timestamp(length?: number): string;

export declare interface Toast {
    type: 'success' | 'error' | 'info';
    message: string;
    duration: number;
    href?: string;
}

export declare const toast: Writable<Partial<Toast>>;

export declare class Toasts extends SvelteComponent<ToastsProps, ToastsEvents, ToastsSlots> {
    get direction(): NonNullable<"from-top" | "from-bottom" | undefined>;
}

declare type ToastsEvents = typeof __propDef_6.events;

declare type ToastsProps = typeof __propDef_6.props;

declare type ToastsSlots = typeof __propDef_6.slots;

/**
 * Toggles {@link theme} to and from light / dark mode
 */
export declare function toggleTheme(): void;

/**
 * A tooltip that appears on hover.
 *
 * @example
 * ```svelte
 * <script>
 * 	import { Tooltip } from 'fractils';
 * </script>
 *
 * <Tooltip content="Hello World">
 * 	<div class="hover-1"> Hover over me! </div>
 * </Tooltip>
 * ```
 */
export declare class Tooltip extends SvelteComponent<TooltipProps, TooltipEvents, TooltipSlots> {
}

declare type TooltipEvents = typeof __propDef_7.events;

declare type TooltipProps = typeof __propDef_7.props;

declare type TooltipSlots = typeof __propDef_7.slots;

/**
 * A faster `.toFixed()` alternative.
 */
export declare function truncate(
/**
 * A number to truncate.
 */
value: number, 
/**
 * The number of decimal places to keep.
 */
decimals: number): number;

/**
 * Recursively processes a tuple type and returns a union of entries.
 * @typeParam T - The tuple type being processed.
 * @typeParam I - The indices of the tuple so far, initialized to an empty array.
 * @typeParam R - The accumulated result, initialized to `never`.
 * @internal
 */
declare type TupleEntry<T extends readonly unknown[], I extends unknown[] = [], R = never> = T extends readonly [infer Head, ...infer Tail] ? TupleEntry<Tail, [...I, unknown], R | [`${I['length']}`, Head]> : R;

declare type UnionState<T> = {
    set: (value: T) => void;
} & Omit<PrimitiveState<T>, 'set'>;

declare type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

/**
 * A type-preserving version of `Object.values`.
 * @param obj - Any object.
 * @returns An array of values with their types preserved.
 *
 * @example Immutable
 * ```ts
 * const foo2 = { a: 1, b: '✨' } as const
 * values(foo2) // (1 | '✨')[]
 * Object.values(foo2) // (1 | '✨')[]
 * ```
 *
 * @example Mutable
 * ```ts
 * const foo1 = { a: 1, b: '✨' }
 * values(foo1) // readonly (number | string)[]
 * Object.values(foo1) // (number | string)[]
 * ```
 */
export declare function values<T extends {}>(object: T): ReadonlyArray<T[keyof T]>;

/**
 * Observes an element's current viewport visibility and dispatches relevant events.
 *
 * Events:
 * - on:change - Triggered when element enters or leaves view.
 * - on:enter - Triggered when element enters view.
 * - on:exit - Triggered when element exits view.
 *
 * @param options - Optional config, see {@link VisibilityOptions}.
 *
 * @example
 *```svelte
 * <script>
 * 	let visible, scrollDir, options = {threshold: 0.25}
 *
 * 	// TypeScript users can import the VisibilityEvent or VisibilityEventDetail type
 * 	function handleChange({ detail }) {
 * 		visible = detail.isVisible
 * 		scrollDir = detail.scrollDirection
 * 	}
 * </script>
 *
 * <div
 * 	use:visibility={options}
 * 	on:v-change={handleChange}
 * 	on:v-enter={doSomething}
 * 	on:v-exit={doSomethingElse}
 * 	class:visible
 * >
 * 	{scrollDir}
 * </div>
 *
 *```
 */
export declare const visibility: Action<HTMLElement, VisibilityOptions, VisibilityAttr>;

export declare interface VisibilityAttr {
    /** Callback fired when element enters or exits view. */
    'on:v-change'?: (event: VisibilityEvent) => void;
    /** Callback fired when element enters view. */
    'on:v-enter'?: (event: VisibilityEvent) => void;
    /** Callback fired when element exits view. */
    'on:v-exit'?: (event: VisibilityEvent) => void;
}

export declare type VisibilityEvent = CustomEvent<VisibilityEventDetail>;

export declare type VisibilityEventDetail = {
    isVisible: boolean;
    entry: IntersectionObserverEntry;
    scrollDirection: ScrollDirection;
    observe: (target: Element) => void;
    unobserve: (target: Element) => void;
};

/**
 * Optional config for `visibility` action.
 */
export declare type VisibilityOptions = {
    /**
     * The root view.
     * @default window
     */
    view?: HTMLElement | null;
    /**
     * Margin around root view - 'px' or '%'.
     * @default '0px'
     */
    margin?: string;
    /**
     * % of pixels required in view to trigger event.  An array will trigger multiple events - '0-1'.
     * @default 0
     */
    threshold?: number | number[];
    /**
     * Whether to dispatch events only once.
     * @default false
     */
    once?: boolean;
};

/**
 * A simple wait timer.
 *
 * @param t - time to wait in ms
 * @returns a promise that resolves after t ms
 * @example
 * ```ts
 * await wait(1000)
 * ```
 */
export declare const wait: (t: number) => Promise<unknown>;

/** chalk.yellow */
export declare function y(...args: unknown[]): string;

export { }
