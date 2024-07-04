/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			theme: 'light' | 'dark' | 'system'
		}
		interface PageData {
			theme: 'light' | 'dark' | 'system'
		}
		// interface Platform {}
	}

	interface ImportMetaEnv {
		VITEST: string
		VITE_FRACTILS_LOG_VITEST: string
		VITE_FRACTILS_LOG_LEVEL: string
	}
}

export {}
