import type { Writable } from 'svelte/store';
/**
 * A Svelte store that uses localStorage to store data asyncronously.
 * @param key - The key to store the data under.
 * @param value - The initial value of the store.
 * @returns a writable store.
 * @example
 * const store = asyncLocalStorageStore('foo', 'bar')
 */
export declare const asyncLocalStorageStore: <T = any>(key: string, value: T) => Writable<T>;
