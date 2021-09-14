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
export const wait = (t: number) => new Promise((res) => setTimeout(res, t))
