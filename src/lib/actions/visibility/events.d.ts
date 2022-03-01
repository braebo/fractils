import type { VisibilityEvent } from './types.ts';

declare namespace svelte.JSX {
    interface HTMLProps<T> {
        'onchange'?: (event: VisibilityEvent) => void;
        'onenter'?: (event: VisibilityEvent) => void;
        'onleave'?: (event: VisibilityEvent) => void;
    }
}