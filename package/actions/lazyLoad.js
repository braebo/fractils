//? Adapted from swyx - https://github.com/sw-yx/svelte-actions/blob/main/src/lazyload.ts
const lazyLoadHandleIntersection = (entries) => {
    entries.forEach((entry) => {
        var _a;
        if (!entry.isIntersecting) {
            return;
        }
        if (!(entry.target instanceof HTMLElement)) {
            return;
        }
        let node = entry.target;
        let attributes = (_a = lazyLoadNodeAttributes.find((item) => item.node === node)) === null || _a === void 0 ? void 0 : _a.attributes;
        Object.assign(node, attributes);
        lazyLoadObserver.unobserve(node);
    });
};
let lazyLoadObserver;
let lazyLoadNodeAttributes = [];
let options = {
    root: typeof document != 'undefined'
        ? document === null || document === void 0 ? void 0 : document.querySelector('#scrollArea')
        : null,
    rootMargin: '0px',
    threshold: 1.0,
};
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
export function lazyLoad(node, attributes, options = {
    rootMargin: '0px',
    threshold: 1.5,
}) {
    if (!lazyLoadObserver) {
        lazyLoadObserver = new IntersectionObserver(lazyLoadHandleIntersection, options);
    }
    lazyLoadNodeAttributes.push({ node, attributes });
    lazyLoadObserver.observe(node);
    return {
        destroy() {
            lazyLoadObserver.unobserve(node);
        },
    };
}
