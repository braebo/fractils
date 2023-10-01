export interface Toast {
	type: 'success' | 'error' | 'info';
	message: string;
	duration: number;
	href?: string;
}

import { toast } from './Toasts.svelte';
import Toasts from './Toasts.svelte';

export { Toasts };
export { toast };

export default Toasts;
