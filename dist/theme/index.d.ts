export declare const theme: {
    set: (value: string | null) => void;
    update: (fn: (T: string | null) => string | null) => void;
    subscribe(this: void, run: import("svelte/store").Subscriber<string | null>, invalidate?: ((value?: string | null | undefined) => void) | undefined): import("svelte/store").Unsubscriber;
};
/**
 * Applies system preference theme and registers a listener for changes
 */
export declare const initTheme: () => Promise<void>;
/**
 * Toggles {@link theme} to and from light / dark mode
 */
export declare const toggleTheme: () => void;
export declare const initComplete: import("svelte/store").Writable<boolean>;
/**
 * Applies a specific theme
 * @param newTheme - The theme to apply
 */
export declare const applyTheme: (newTheme: string) => void;
