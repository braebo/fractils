import asyncLocalStorageStore from '$lib/utils/asyncLocalStorageStore'
import { browser } from '$app/env'

const initialTheme = browser && globalThis.localStorage && 'theme' in localStorage ? localStorage.getItem('theme') : 'dark'

export const theme = asyncLocalStorageStore('theme', initialTheme)
