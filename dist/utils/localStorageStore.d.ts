/**
 * A Svelte store that uses localStorage to store data asyncronously.
 * @param key - The key to store the data under.
 * @param initial - The initial value of the store.
 * @example
 * const store = localStorageStore('foo', 'bar')
 */
export declare const localStorageStore: <T>(key: string, initial: T) => {
    set: (value: T) => void;
    update: (fn: (T: T) => T) => void;
    subscribe(this: void, run: import("svelte/store").Subscriber<T>, invalidate?: ((value?: T | undefined) => void) | undefined): import("svelte/store").Unsubscriber;
};
