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
export declare type OnMountProps = typeof __propDef.props;
export declare type OnMountEvents = typeof __propDef.events;
export declare type OnMountSlots = typeof __propDef.slots;
export default class OnMount extends SvelteComponentTyped<OnMountProps, OnMountEvents, OnMountSlots> {
}
export {};
