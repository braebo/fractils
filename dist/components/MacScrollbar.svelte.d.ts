import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        /**
             * The scrollbar root element or it's query selector.
             * @default `document.body`
             */ root?: string | Element | null | undefined;
        /**
             * Destroys the component.
             * @default `true` on mobile if not overridden.
             * @note This component only works on viewport-sized elements.
             */ disabled: boolean;
        /**
             * % of the scrollbar track to pad at the top and bottom.
             * @default `0.2`
             */ padding?: 0.2 | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type MacScrollbarProps = typeof __propDef.props;
export declare type MacScrollbarEvents = typeof __propDef.events;
export declare type MacScrollbarSlots = typeof __propDef.slots;
export default class MacScrollbar extends SvelteComponentTyped<MacScrollbarProps, MacScrollbarEvents, MacScrollbarSlots> {
    get padding(): number;
}
export {};
