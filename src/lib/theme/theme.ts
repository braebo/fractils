import { get, writable } from 'svelte/store'
import { Logger } from '$lib/utils/logger'
import { state } from '../utils/state'
import { bd } from '../utils/l'

export type Theme = 'light' | 'dark' | 'system'

const initialTheme: Theme =
	typeof window !== 'undefined' && globalThis.localStorage && 'theme' in localStorage
		? (localStorage.getItem('theme') as Theme) ?? 'dark'
		: 'dark'

const log = new Logger('themer', { fg: 'white' })

// export const theme = localStorageStore<Theme>('theme', initialTheme as Theme)

/**
 * A store for the current theme persisted in local storage.
 */
export const theme = state<Theme>(initialTheme, {
	key: 'fractils::theme',
	// todo - add cookie mode to `state` and use that here
	// storage: 'cookie' as 'cookie' | 'localStorage'
	onChange: () => {
		if (typeof window === 'undefined') return
		document.documentElement.setAttribute('theme', get(theme))
	},
})

const detectSystemPreference = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light')

/**
 * Applies system preference theme and registers a listener for changes.
 */
export async function initTheme() {
	if (typeof window === 'undefined') return
	window
		?.matchMedia('(prefers-color-scheme: dark)')
		.addEventListener('change', detectSystemPreference)

	const pref = theme.value

	if (!pref) {
		log.fn('initTheme').info('No theme found - applying system theme.')
		applySystemTheme()
		return
	}

	applyTheme(pref)
}

/**
 * Toggles {@link theme} to and from light / dark mode
 */
export function toggleTheme() {
	if (typeof window === 'undefined') return
	const activeTheme = theme ? get(theme) : initialTheme
	const newTheme = activeTheme == 'light' ? 'dark' : 'light'
	log.fn('toggleTheme')

	applyTheme(newTheme)
}

export const initComplete = writable(false)

const applySystemTheme = (): void => {
	if (typeof window === 'undefined') return
	const newTheme = window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

	log.fn('applySystemTheme').info('Setting theme to ' + bd(newTheme) + '.')
	applyTheme(newTheme)
}

/**
 * Applies a specific theme
 * @param newTheme - The theme to apply
 */
export function applyTheme(newTheme: Theme) {
	if (typeof window === 'undefined') return
	try {
		log.fn('applyTheme').info('Setting theme to ' + bd(newTheme) + '.')
		theme?.set(newTheme)
	} catch (err) {
		log.error('Unable to save theme preference in local storage 😕')
	}
}
