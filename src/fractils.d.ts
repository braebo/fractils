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

declare const __propDef_6: {
    props: {
        /**
         * Text content of the tooltip.
         */ content?: string | undefined;
        /**
         * Placement of the tooltip.
         * @defaultValue 'right'
         */ placement?: (string & {}) | "left" | "right" | "top" | "bottom" | undefined;
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
         */ display?: (string & {}) | "none" | "contents" | undefined;
        instance?: Instance<PopperElement> | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};

declare const __propDef_7: {
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
    slots: {};
    events: {
        /** Toggles the switch. */
        click: MouseEvent;
    };
};

declare const __propDef_8: {
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

declare const __propDef_9: {
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
         */ lang?: Lang | undefined;
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

/**
 * Calls a function when the user clicks outside the element.
 * @example
 * ```svelte
 * <div on:outclick={someFunction} use:add={{ whitelist: ['.burger'] }}>
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

/**
 * A Svelte store that uses localStorage to store data asyncronously.
 * @param key - The key to store the data under.
 * @param value - The initial value of the store.
 * @returns a writable store.
 * @example
 * const store = asyncLocalStorageStore('foo', 'bar')
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

declare type CodeEvents = typeof __propDef_9.events;

declare type CodeProps = typeof __propDef_9.props;

declare type CodeSlots = typeof __propDef_9.slots;

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

/**
 * Converts a decimal to a power of 10.
 */
export declare function decimalToPow(value: number): number;

export declare const defer: (((callback: IdleRequestCallback, options?: IdleRequestOptions | undefined) => number) & typeof requestIdleCallback) | ((fn: () => void) => number);

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

export declare class Inspector extends SvelteComponent<InspectorProps, InspectorEvents, InspectorSlots> {
}

declare type InspectorEvents = typeof __propDef_2.events;

declare type InspectorProps = typeof __propDef_2.props;

declare type InspectorSlots = typeof __propDef_2.slots;

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
 * @param key - The key to store the data under.
 * @param initial - The initial value of the store.
 * @example
 * const store = localStorageStore('foo', 'bar')
 */
export declare const localStorageStore: <T>(key: string, initial: T) => Writable<T>;

/**
 * A simple logger that only runs in dev environments.
 * @param msg - A string or object to log
 * @param color - Any CSS color value ( named | hex | rgb | hsl )
 * @param bgColor - Same as color ⇧
 * @param fontSize - Any number
 * @param css - Optional additional CSS
 */
export declare const log: (msg: string | any, color?: string, bgColor?: string, fontSize?: number, css?: string) => void;

/** chalk.magenta */
export declare function m(...args: unknown[]): string;

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

/** orange chalk.hex('#cc6630') */
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

export declare type Position = {
    x?: number;
    y?: number;
};

/** chalk.red */
export declare function r(...args: unknown[]): string;

export declare const randomColor: () => "AliceBlue" | "AntiqueWhite" | "Aqua" | "Aquamarine" | "Azure" | "Beige" | "Bisque" | "Black" | "BlanchedAlmond" | "Blue" | "BlueViolet" | "Brown" | "BurlyWood" | "CadetBlue" | "Chartreuse" | "Chocolate" | "Coral" | "CornflowerBlue" | "Cornsilk" | "Crimson" | "Cyan" | "DarkBlue" | "DarkCyan" | "DarkGoldenRod" | "DarkGray" | "DarkGrey" | "DarkGreen" | "DarkKhaki" | "DarkMagenta" | "DarkOliveGreen" | "DarkOrange" | "DarkOrchid" | "DarkRed" | "DarkSalmon" | "DarkSeaGreen" | "DarkSlateBlue" | "DarkSlateGray" | "DarkSlateGrey" | "DarkTurquoise" | "DarkViolet" | "DeepPink" | "DeepSkyBlue" | "DimGray" | "DimGrey" | "DodgerBlue" | "FireBrick" | "FloralWhite" | "ForestGreen" | "Fuchsia" | "Gainsboro" | "GhostWhite" | "Gold" | "GoldenRod" | "Gray" | "Grey" | "Green" | "GreenYellow" | "HoneyDew" | "HotPink" | "IndianRed" | "Indigo" | "Ivory" | "Khaki" | "Lavender" | "LavenderBlush" | "LawnGreen" | "LemonChiffon" | "LightBlue" | "LightCoral" | "LightCyan" | "LightGoldenRodYellow" | "LightGray" | "LightGrey" | "LightGreen" | "LightPink" | "LightSalmon" | "LightSeaGreen" | "LightSkyBlue" | "LightSlateGray" | "LightSlateGrey" | "LightSteelBlue" | "LightYellow" | "Lime" | "LimeGreen" | "Linen" | "Magenta" | "Maroon" | "MediumAquaMarine" | "MediumBlue" | "MediumOrchid" | "MediumPurple" | "MediumSeaGreen" | "MediumSlateBlue" | "MediumSpringGreen" | "MediumTurquoise" | "MediumVioletRed" | "MidnightBlue" | "MintCream" | "MistyRose" | "Moccasin" | "NavajoWhite" | "Navy" | "OldLace" | "Olive" | "OliveDrab" | "Orange" | "OrangeRed" | "Orchid" | "PaleGoldenRod" | "PaleGreen" | "PaleTurquoise" | "PaleVioletRed" | "PapayaWhip" | "PeachPuff" | "Peru" | "Pink" | "Plum" | "PowderBlue" | "Purple" | "RebeccaPurple" | "Red" | "RosyBrown" | "RoyalBlue" | "SaddleBrown" | "Salmon" | "SandyBrown" | "SeaGreen" | "SeaShell" | "Sienna" | "Silver" | "SkyBlue" | "SlateBlue" | "SlateGray" | "SlateGrey" | "Snow" | "SpringGreen" | "SteelBlue" | "Tan" | "Teal" | "Thistle" | "Tomato" | "Turquoise" | "Violet" | "Wheat" | "White" | "WhiteSmoke" | "Yellow" | "YellowGreen";

/** A custom range input slider component. */
declare class Range_2 extends SvelteComponent<RangeProps, RangeEvents, RangeSlots> {
}
export { Range_2 as Range }

declare type RangeEvents = typeof __propDef_8.events;

declare type RangeProps = typeof __propDef_8.props;

declare type RangeSlots = typeof __propDef_8.slots;

/**
 * Get the value of a command line argument by name from an array of arguments.
 */
export declare function resolveArg(name: string, args: string[]): string | true | undefined;

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

declare type SwitchEvents = typeof __propDef_7.events;

declare type SwitchProps = typeof __propDef_7.props;

declare type SwitchSlots = typeof __propDef_7.slots;

/**
 * A store for the current theme persisted in local storage.
 */
export declare const theme: Writable<Theme_2>;

declare type Theme_2 = 'light' | 'dark' | (string & {});

/** A theme toggle button with slots for light and dark mode icons. */
export declare class ThemeToggle extends SvelteComponent<ThemeToggleProps, ThemeToggleEvents, ThemeToggleSlots> {
}

declare type ThemeToggleEvents = typeof __propDef_4.events;

declare type ThemeToggleProps = typeof __propDef_4.props;

declare type ThemeToggleSlots = typeof __propDef_4.slots;

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

declare type ToastsEvents = typeof __propDef_5.events;

declare type ToastsProps = typeof __propDef_5.props;

declare type ToastsSlots = typeof __propDef_5.slots;

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
 * import { Tooltip } from 'fractils';
 * </script>
 *
 * <Tooltip content="Hello World">
 * <div class="hover-1"> Hover over me! </div>
 * </Tooltip>
 * ```
 */
export declare class Tooltip extends SvelteComponent<TooltipProps, TooltipEvents, TooltipSlots> {
}

declare type TooltipEvents = typeof __propDef_6.events;

declare type TooltipProps = typeof __propDef_6.props;

declare type TooltipSlots = typeof __propDef_6.slots;

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
 *  <!-- TypeScript users can import the VisibilityEvent or VisibilityEventDetail type -->
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
