import { browser } from './browser';

export const dev = (() => {
	if (!browser) return;
	if (typeof process != 'undefined') {
		return process.env?.NODE_ENV === 'development';
	} else {
		try {
			return import.meta.env.DEV;
		} catch (e) {
			console.error(e);
		}
	}
	return false;
})();
