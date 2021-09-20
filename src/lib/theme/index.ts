import { browser, asyncLocalStorageStore } from '$lib'

const initialTheme =
	browser && globalThis.localStorage && 'theme' in localStorage
		? localStorage.getItem('theme')
		: 'dark'

export const theme = asyncLocalStorageStore('theme', initialTheme)

export * from './themeManager'
