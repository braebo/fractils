export declare type Event = 'v-change' | 'v-leave' | 'v-exit' | 'v-enter';
/**
 * Optional config
 * @param {HTMLElement} view - The root view (default: window)
 * @param {string} margin - Margin around root view - 'px' or '%' (default: '0px')
 * @param {number | number[]} threshold - % of pixels required in view to trigger event.  An array will trigger multiple events - '0-1' (default: 0).
 * @param {boolean} once - Whether to dispatch events only once (default: false)
 */
export declare type VisibilityOptions = {
    view?: HTMLElement | null;
    margin?: string;
    threshold?: number | number[];
    once?: boolean;
};
export declare type Position = {
    x?: number;
    y?: number;
};
export declare type Direction = 'up' | 'down' | 'left' | 'right';
export declare type ScrollDirection = {
    vertical?: Direction;
    horizontal?: Direction;
};
export declare type VisibilityEventDetail = {
    isVisible: boolean;
    entry: IntersectionObserverEntry;
    scrollDirection: ScrollDirection;
    observe: (target: Element) => void;
    unobserve: (target: Element) => void;
};
export declare type VisibilityEvent = CustomEvent<VisibilityEventDetail>;
