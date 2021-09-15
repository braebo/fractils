import { browser } from './browser';
export const dev = (() => {
    var _a;
    if (!browser)
        return;
    if (typeof process != 'undefined') {
        return ((_a = process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV) === 'development';
    }
    else {
        try {
            return import.meta.env.DEV;
        }
        catch (e) {
            console.error(e);
        }
    }
    return false;
})();
