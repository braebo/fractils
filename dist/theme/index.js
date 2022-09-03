import { localStorageStore } from '../utils/localStorageStore';
import { get, writable } from 'svelte/store';
const initialTheme = typeof window !== 'undefined' && globalThis.localStorage && 'theme' in localStorage
    ? localStorage.getItem('theme')
    : 'dark';
export const theme = localStorageStore('theme', initialTheme);
const detectSystemPreference = (e) => applyTheme(e.matches ? 'dark' : 'light');
/**
 * Applies system preference theme and registers a listener for changes
 */
export const initTheme = async () => {
    if (typeof window === 'undefined')
        return;
    window === null || window === void 0 ? void 0 : window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectSystemPreference);
    if (localStorage)
        if ('theme' in localStorage && theme) {
            try {
                const pref = get(theme);
                if (pref) {
                    applyTheme(pref);
                }
            }
            catch (err) {
                console.log('%c Unable to access theme preference in local storage 😕', 'color:coral');
                console.error(err);
                localStorage.removeItem('theme');
            }
        }
        else {
            applySystemTheme();
        }
};
/**
 * Toggles {@link theme} to and from light / dark mode
 */
export const toggleTheme = () => {
    if (typeof window === 'undefined')
        return;
    const activeTheme = theme ? get(theme) : initialTheme;
    activeTheme == 'light' ? applyTheme('dark') : applyTheme('light');
};
export const initComplete = writable(false);
const applySystemTheme = () => {
    if (typeof window === 'undefined')
        return;
    (window === null || window === void 0 ? void 0 : window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? applyTheme('dark')
        : applyTheme('light');
};
/**
 * Applies a specific theme
 * @param newTheme - The theme to apply
 */
export const applyTheme = (newTheme) => {
    var _a;
    if (typeof window === 'undefined')
        return;
    (_a = document === null || document === void 0 ? void 0 : document.documentElement) === null || _a === void 0 ? void 0 : _a.setAttribute('theme', newTheme);
    try {
        theme === null || theme === void 0 ? void 0 : theme.set(newTheme);
    }
    catch (err) {
        console.error('%c Unable to save theme preference in local storage 😕', 'color:coral');
    }
};
