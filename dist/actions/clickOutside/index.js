import './events.d';
/**
 * Calls a function when the user clicks outside the element.
 * @example
 * ```svelte
 * <div on:outclick={someFunction} use:clickOutside={{ whitelist: ['.burger'] }}>
 * ```
 */
export const clickOutside = (node, options = {}) => {
    const handleClick = (event) => {
        let disable = false;
        for (const className of options.whitelist || []) {
            if (event.target instanceof Element && event.target.classList.contains(className)) {
                disable = true;
            }
        }
        if (!disable && node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(new CustomEvent('outclick', {
                detail: {
                    target: event.target,
                },
            }));
        }
    };
    document.addEventListener('click', handleClick, true);
    return {
        update: (newOptions) => (options = { ...options, ...newOptions }),
        destroy() {
            document.removeEventListener('click', handleClick, true);
        },
    };
};
