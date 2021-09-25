import { localStorageStore } from '../utils/localStorageStore'
import { get, writable } from 'svelte/store'
import { log } from '../utils/log'
import { browser } from '$app/env'

const initialTheme = () => {
	if (!browser) return
	else
		return globalThis.localStorage && 'theme' in localStorage
			? localStorage.getItem('theme')
			: 'dark'
}

export const theme: ReturnType<typeof writable> = localStorageStore('theme', initialTheme)

const detectSystemPreference = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light')

/**
 * Applies system preference theme and registers a listener for changes
 */
export const initTheme = async (): Promise<void> => {
	if (!browser) return
	log('Init theme()', 'white')
	window
		?.matchMedia('(prefers-color-scheme: dark)')
		.addEventListener('change', detectSystemPreference)

	if (localStorage)
		if ('theme' in localStorage && theme) {
			try {
				const pref = get(theme)
				if (pref) {
					log('theme found in localStorage', 'white', '', 20)
					applyTheme(pref as string)
				}
			} catch (err) {
				console.log(
					'%c Unable to access theme preference in local storage 😕',
					'color:coral',
				)
				console.error(err)
				localStorage.removeItem('theme')
			}
		} else {
			applySystemTheme()
		}
}

/**
 * Toggles {@link theme} to and from light / dark mode
 */
export const toggleTheme = (): void => {
	if (!browser) return
	const activeTheme = theme ? get(theme) : initialTheme
	activeTheme == 'light' ? applyTheme('dark') : applyTheme('light')
}

export const initComplete = writable(false)

const applySystemTheme = (): void => {
	if (!browser) return
	window?.matchMedia('(prefers-color-scheme: dark)').matches
		? applyTheme('dark')
		: applyTheme('light')
}

/**
 * Applies a specific theme
 * @param newTheme - The theme to apply
 */
export const applyTheme = (newTheme: string): void => {
	if (!browser) return
	document.documentElement.setAttribute('theme', newTheme)
	try {
		theme?.set(newTheme)
	} catch (err) {
		console.log('%c Unable to save theme preference in local storage 😕', 'color:coral')
	}
}
