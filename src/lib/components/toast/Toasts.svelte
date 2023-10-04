<script lang="ts" context="module">
	import { toast, type Toast } from './toast';

	import { writable } from 'svelte/store';

	const toasts = createToastStore();

	function createToastStore() {
		let uid = 0;
		const { subscribe, update } = writable<(Toast & { id: number })[]>([]);

		return {
			subscribe,
			add: (toast: Toast) => {
				update((toasts) => [{ ...toast, id: uid++ }, ...toasts]);
			},
			remove: (id: number) => {
				update((toasts) => toasts.filter((toast) => toast.id !== id));
			},
		};
	}
</script>

<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import ToastComponent from './Toast.svelte';
	import { quintOut } from 'svelte/easing';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import { DEV } from 'esm-env';

	let transitionDuration = 1000;

	let disabled = false;
	let disableCooldown: NodeJS.Timeout;

	export let top = undefined as string | undefined;
	export let right = undefined as string | undefined;
	export let bottom = undefined as string | undefined;
	export let left = undefined as string | undefined;
	export let margin = `auto`;

	export const direction: 'from-top' | 'from-bottom' = top ? 'from-top' : 'from-bottom';
	$: flexDirection = direction === 'from-top' ? 'column-reverse' : 'column';

	const undef = (anything: any) => typeof anything === 'undefined';
	if (undef(top) && undef(right) && undef(bottom) && undef(left)) {
		right = '0';
		bottom = '1rem';
		left = '0';
	}

	const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 200),
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			const { delay = 0, duration = 600 as number, easing = quintOut } = params;

			return {
				duration: duration as number,
				delay,
				easing,
				css: (t, u) => `
					transform: translateY(${u * 6}px) ${transform};
					opacity: ${t};
				`,
			};
		},
	});

	function handleComplete(e: CustomEvent<Toast & { id: number }>) {
		if (e.detail) {
			toasts.remove(e.detail.id);
		}
	}

	onMount(() => {
		const unsubscribe = toast.subscribe((e) => {
			if (!e) return;
			if (!disabled) {
				e.type ??= 'info';
				e.duration ??= 5000;
				e.message ??= DEV ? 'Toast message not provided.' : '';

				toasts.add(e as Toast);
			}
		});

		return () => {
			unsubscribe();
			clearTimeout(disableCooldown);
		};
	});
</script>

<div class="fullscreen-toast-fixture">
	<div
		class="toasts"
		style:top
		style:right
		style:bottom
		style:left
		style:margin
		style:flexDirection
	>
		{#each $toasts as toast (toast.id)}
			<div
				class="flip"
				animate:flip={{ duration: transitionDuration }}
				in:receive={{ key: toast.id }}
				out:send={{ key: toast.id }}
			>
				<div class="card">
					{#if toast}
						<ToastComponent {toast} on:complete={handleComplete} />
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.fullscreen-toast-fixture {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;

		pointer-events: none;

		z-index: 111;
	}

	.toasts {
		z-index: 112;

		position: absolute;

		display: flex;
		flex-direction: column;
		gap: 1rem;
		transition: 1s;

		width: 300px;
		height: fit-content;
		padding-top: 1rem;

		contain: none;
		user-select: none;
		pointer-events: none;

		/* Super weird flash on page-load without this... */
		background-color: transparent !important;
	}

	.flip {
		position: relative;
	}
</style>
