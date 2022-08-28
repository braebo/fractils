/** @typedef {typeof __propDef.props}  ThemeToggleProps */
/** @typedef {typeof __propDef.events}  ThemeToggleEvents */
/** @typedef {typeof __propDef.slots}  ThemeToggleSlots */
export default class ThemeToggle extends SvelteComponentTyped<{
    init?: boolean | undefined;
    config?: {
        y: number;
        duration: number;
        easing: typeof expoOut;
    } | undefined;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
    light: {};
    dark: {};
}> {
    get init(): boolean;
    get config(): {
        y: number;
        duration: number;
        easing: typeof expoOut;
    };
}
export type ThemeToggleProps = typeof __propDef.props;
export type ThemeToggleEvents = typeof __propDef.events;
export type ThemeToggleSlots = typeof __propDef.slots;
import { expoOut } from "svelte/types/runtime/easing";
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        init?: boolean | undefined;
        config?: {
            y: number;
            duration: number;
            easing: typeof expoOut;
        } | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
        light: {};
        dark: {};
    };
};
export {};
