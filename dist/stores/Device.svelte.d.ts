import { SvelteComponentTyped } from "svelte";
/**
 * Tracks the screen height.
 */
export declare const screenH: import("svelte/store").Writable<number>;
/**
 * Tracks the screen width.
 */
export declare const screenW: import("svelte/store").Writable<number>;
/**
 * Adjusts the $mobile 'breakpoint' threshold.
 */
export declare const mobileThreshold: import("svelte/store").Writable<number>;
/**
 * Detects screen width below 900px
 */
export declare const mobile: import("svelte/store").Readable<boolean>;
/**
 * Tracks the users scroll position.
 */
export declare const scrollY: import("svelte/store").Writable<number>;
/**
 * Tracks the users mouse position.
 * @param {number} x - The x position of the mouse.
 * @param {number} y - The y position of the mouse.
 */
export declare const mouse: import("svelte/store").Writable<{
    x: number;
    y: number;
}>;
declare const __propDef: {
    props: {};
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type DeviceProps = typeof __propDef.props;
export declare type DeviceEvents = typeof __propDef.events;
export declare type DeviceSlots = typeof __propDef.slots;
export default class Device extends SvelteComponentTyped<DeviceProps, DeviceEvents, DeviceSlots> {
}
export {};
