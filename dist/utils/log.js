const browser = typeof globalThis.window !== 'undefined' && typeof globalThis.window.document !== 'undefined';
const dev = () => {
    var _a, _b, _c, _d, _e;
    if (!browser)
        return false;
    return (_e = (_b = ((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV) === 'development') !== null && _b !== void 0 ? _b : (_d = (_c = import.meta) === null || _c === void 0 ? void 0 : _c.env) === null || _d === void 0 ? void 0 : _d.DEV) !== null && _e !== void 0 ? _e : false;
};
/**
 * A simple logger that only runs in dev environments.
 * @param msg - A string or object to log
 * @param color - Any CSS color value ( named | hex | rgb | hsl )
 * @param bgColor - Same as color ⇧
 * @param fontSize - Any number
 * @param css - Optional additional CSS
 */
export const log = (msg, color = 'lightblue', bgColor = 'transparent', fontSize = 15, css = '') => {
    if (!dev)
        return;
    if (typeof msg == 'string')
        return () => console.log(`%c${msg}`, `padding:5px;color:${color};background: ${bgColor};border:1px solid ${color};size:${fontSize}px;${css}`);
    return console.log(msg);
};
