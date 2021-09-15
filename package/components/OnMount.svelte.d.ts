/** @typedef {typeof __propDef.props}  OnMountProps */
/** @typedef {typeof __propDef.events}  OnMountEvents */
/** @typedef {typeof __propDef.slots}  OnMountSlots */
export default class OnMount extends SvelteComponentTyped<{}, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type OnMountProps = typeof __propDef.props;
export type OnMountEvents = typeof __propDef.events;
export type OnMountSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {};
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export {};
