import { writable } from 'svelte/store';

export interface Toast {
	type: 'success' | 'error' | 'info';
	message: string;
	duration: number;
	href?: string;
}

export const toast = writable<Partial<Toast>>();
