export const browser =
	typeof globalThis.window !== 'undefined' &&
	typeof globalThis.window.document !== 'undefined';
