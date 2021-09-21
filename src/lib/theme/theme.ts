import { asyncLocalStorageStore } from '$lib'
import type { writable } from 'svelte/store'
import { browser } from '$app/env'

const initialTheme =
	browser && globalThis.localStorage && 'theme' in localStorage
		? localStorage.getItem('theme')
		: 'dark'

export const theme: ReturnType<typeof writable> | null = browser
	? asyncLocalStorageStore('theme', initialTheme)
	: null
