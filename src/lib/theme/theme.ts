import { Logger } from '$lib/utils/logger'
import { state } from '../utils/state'
import { BROWSER } from 'esm-env'
import { bd } from '../utils/l'
import { parse } from 'cookie'

export type Theme = 'light' | 'dark' | 'system'

export const FRACTILS_THEME_ID = 'fractils::theme'

const initialTheme: Theme | '' =
	// Cookie?
	(globalThis.document?.cookie && (parse(document.cookie)?.[FRACTILS_THEME_ID] as Theme)) ||
	// localStorage?
	(globalThis.localStorage &&
		'theme' in localStorage &&
		(localStorage.getItem(FRACTILS_THEME_ID) as Theme)) ||
	// Fallback.
	''

const log = new Logger('fractils|theme', { fg: 'aliceblue' })

/**
 * A store for the current theme persisted in local storage.
 */
export const theme = state<Theme>(initialTheme as Theme, {
	key: FRACTILS_THEME_ID,
	onChange: () => {
		if (typeof window === 'undefined') return
		document.documentElement.setAttribute('theme', theme.value)
	},
	// cookie: true, // todo - would be cool if `state` had a cookie mode
})

const detectSystemPreference = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light')

/**
 * Applies system preference theme and registers a listener for changes.
 */
export async function initTheme(options?: {
	/**
	 * The initial theme to apply.
	 */
	initial?: Theme
	/**
	 * Whether to persist the theme in a cookie.
	 */
	cookie?: boolean
}) {
	if (typeof window === 'undefined') return

	window
		?.matchMedia('(prefers-color-scheme: dark)')
		.addEventListener('change', detectSystemPreference)

	const pref = theme.value

	if (BROWSER && options?.cookie) {
		const cookieTheme = parse(document.cookie)[FRACTILS_THEME_ID]

		if (['light', 'dark', 'system'].includes(cookieTheme)) {
			theme.set(cookieTheme as Theme)
		}

		theme.subscribe(value => {
			if (BROWSER) {
				document.cookie = `fractils::theme=${value}; path=/;`
			}
		})
	} else {
		if (options?.initial && options?.initial !== pref && initialTheme) {
			applyTheme(initialTheme)
		} else if (!pref) {
			log.fn('initTheme').info('No theme found - applying default:', 'system')
			applySystemTheme()
		} else {
			applyTheme(pref)
		}
	}
}

/**
 * Toggles {@link theme} to and from light / dark mode
 */
export function toggleTheme() {
	if (typeof window === 'undefined') return
	const activeTheme = theme ? theme.value : initialTheme
	const newTheme = activeTheme == 'light' ? 'dark' : 'light'
	log.fn('toggleTheme')

	applyTheme(newTheme)
}

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
