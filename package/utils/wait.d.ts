/**
 * A simple wait timer.
 *
 * @param t - time to wait in ms
 * @returns a promise that resolves after t ms
 * @example
 * ```ts
 * await wait(1000)
 * ```
 */
export declare const wait: (t: number) => Promise<unknown>;
