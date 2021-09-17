import { get, writable } from 'svelte/store'
import Logger from '$utils/logger'
import { theme } from './theme'

const { log } = Logger
const detectSystemPreference = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light')

export const initTheme = async (): Promise<void> => {
	log('Init theme()')
	window?.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectSystemPreference)

	if (localStorage)
		if ('theme' in localStorage) {
			try {
				const pref = get(theme)
				if (pref) {
					log('theme found in localStorage: ' + pref, 'white', 20, 'purple')
					applyTheme(pref as string)
				}
			} catch (err) {
				console.log('%c Unable to access theme preference in local storage 😕', 'color:coral')
				console.error(err)
				localStorage.removeItem('theme')
			}
		} else {
			applySystemTheme()
		}
}

export const toggleTheme = (): void => {
	const activeTheme = get(theme)
	activeTheme == 'light' ? applyTheme('dark') : applyTheme('light')
}

export const initComplete = writable(false)

const applySystemTheme = (): void => {
	window?.matchMedia('(prefers-color-scheme: dark)').matches ? applyTheme('dark') : applyTheme('light')
}

const applyTheme = (newTheme: string): void => {
	document.documentElement.setAttribute('theme', newTheme)
	try {
		theme.set(newTheme)
	} catch (err) {
		console.log('%c Unable to save theme preference in local storage 😕', 'color:coral')
	}
}
