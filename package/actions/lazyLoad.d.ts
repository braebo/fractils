import type { Action } from './types';
interface IntersectionObserverOptions {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number;
}
/**
 * Attach onto any image to lazy load it
 * @param options - optional config
 * @param options.root - The base element used to calculate the threshold
 * @param options.rootMargin -   The base element used to calculate the threshold
 * @param options.threshold - The threshold used to trigger the intersection obeserver
 *
 * @example
 * ```
 *  <img use:lazyLoad={{src:"/myimage"}} alt="">
 * ```
 *
 */
export declare function lazyload(node: HTMLElement, attributes: Object, options?: IntersectionObserverOptions): ReturnType<Action>;
export {};
