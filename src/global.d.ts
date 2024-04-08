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
}

export {}
