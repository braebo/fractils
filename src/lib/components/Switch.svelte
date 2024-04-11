<!--
	@component
	A native checkbox that looks like a switch.

	@remarks The switch is designed to have a fixed size for consistency. It's best placed within a passive container that softly wraps the input, such as one with a width set to 'fit-content'. If the switch is placed in a parent container that's too small, adjust the size of the switch using the `--switch-width` and `--switch-height` custom properties, or adjust the size of the parent container. The switch does not automatically adjust its size based on the parent container.

	@example Basic
	```html
	<script>
		import Switch from '$lib/components/Switch.svelte'
		
		let checked = false
		$: console.log(checked ? 'on' : 'off')
	</script>

	<Switch bind:checked />
	```

	@example Theme Switcher
	```html
	<script>
		import { theme, toggleTheme } from 'fractils'
		import Switch from '$lib/components/Switch.svelte'
	</script>

	<Switch
		on="🌞"
		off="🌙"
		title="theme switcher"
		checked={$theme === 'dark'}
		on:click={toggleTheme}
		--switch-accent="var(--bg-d)"
	/>
	```
-->

<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	interface $$Events {
		/** Toggles the switch. */
		change: MouseEvent
	}

	interface $$Props {
		/** The content to display when the switch is on. */
		on?: string
		/** The content to display when the switch is off. */
		off?: string
		/** Visible to screen readers / tooltips. */
		title?: string
		/**
		 * Whether the switch is checked or not.
		 * @default false
		 */
		checked?: boolean
		/** Whether the switch is disabled or not. */
		disabled?: boolean
		// Colors
		/** The outline color of the switch. */
		'--switch-outline'?: string
		/** The primary color of the switch, used for the thumb. */
		'--switch-primary'?: string
		/** The secondary color of the switch, used for the slider. */
		'--switch-secondary'?: string
		/** The accent color of the switch. */
		'--switch-accent'?: string
		// Shape
		/** The width of the switch. */
		'--switch-width'?: string
		/** The padding of the switch. */
		'--switch-padding'?: string
		/** The size of the switch thumb. */
		'--switch-thumb-size'?: string
		/** The ratio of the switch thumb's width to height. */
		'--switch-thumb-ratio'?: string
		/** The border-radius of the switch slider. */
		'--switch-slider-radius'?: string
		/** The border-radius of the switch thumb. */
		'--switch-thumb-radius'?: string
	}

	export let on = ''
	export let off = ''
	export let thumbOn = ''
	export let thumbOff = ''
	export let title = ''
	export let checked = false
	export let disabled = false

	const id = title.replace(' ', '') + '-switch'

	function toggle() {
		checked = !checked
		dispatch('change', { checked })
	}
</script>

<button class="switch" {title} class:disabled on:click={toggle}>
	<input type="checkbox" bind:checked on:change name={id} />
	<span class="slider round" class:disabled>
		<span class="thumb-content on" aria-hidden="true">
			<slot name="thumb-content-on">
				{thumbOn}
			</slot>
		</span>

		<span class="thumb-content off" aria-hidden="true">
			<slot name="thumb-content-off">
				{thumbOff}
			</slot>
		</span>

		<span class="slider-content on" aria-hidden="true">
			<slot name="on">
				{on}
			</slot>
		</span>

		<span class="slider-content off" aria-hidden="true">
			<slot name="off">
				{off}
			</slot>
		</span>
	</span>
</button>

<style lang="scss">
	$thumb: '.slider:before';

	.switch {
		/* User-facing */
		all: unset;

		--width: var(--switch-width, 3.25rem);
		--padding: var(--switch-padding, 0.25rem);
		--accent: var(--switch-accent, #2196f3);
		--thumb-size: var(--switch-thumb-size, 1.1rem);
		--thumb-ratio: var(--switch-thumb-ratio, 1);
		--slider-radius: var(--switch-slider-radius, 1.25rem);
		--thumb-radius: var(--switch-thumb-radius, 1rem);

		--thumb: var(--switch-thumb, var(--bg-a, white));
		--thumb-dark: var(--switch-thumb, var(--bg-a, white));

		--thumb-on: var(--switch-thumb-on, var(--thumb));
		--thumb-on-dark: var(--switch-thumb-on-dark, var(--thumb));

		--thumb-off: var(--switch-thumb-off, var(--thumb));
		--thumb-off-dark: var(--switch-thumb-off-dark, var(--thumb));

		--slider: var(--switch-slider, var(--bg-b, lightgray));
		--slider-dark: var(--switch-slider, var(--bg-c, lightgray));

		--slider-on: var(--switch-slider-on, var(--accent));
		--slider-on-dark: var(--switch-slider-on-dark, var(--accent));

		--slider-off: var(--switch-slider-off, var(--slider));
		--slider-off-dark: var(--switch-slider-off-dark, var(--slider));

		--outline: var(--switch-outline, var(--slider));
		--outline-dark: var(--switch-outline, var(--slider));
		--outline-focus: var(--switch-outline-focus, var(--bg-c));
		--outline-focus-dark: var(--switch-outline-focus-dark, var(--bg-d));

		/* Internal */

		--height: calc(var(--thumb-size) * var(--thumb-ratio) + var(--padding) * 2);
		// --transition: 0.4s cubic-bezier(0.29, 0.68, 0.29, 0.96);
		--transition: 1s cubic-bezier(0.15, 1.19, 0, 1);
		--transform: calc(var(--width) - var(--thumb-size) - var(--padding) * 2);
	}

	// This is breaking the theme system for some reason...
	// There must be some behavior around :global, CSS variable
	// mutation, or the :root el that I'm not aware of.

	:global(:root[theme='dark'] .switch) {
		--thumb: var(--thumb-dark, var(--thumb, var(--bg-d, #aaa)));
		--slider: var(--slider-dark, var(--slider, var(--bg-b, #333)));
		--thumb-on: var(--thumb-on-dark, var(--thumb, var(--bg-d, #aaa)));
		--slider-on: var(--slider-on-dark, var(--accent, var(--bg-b, #333)));
		--thumb-off: var(--thumb-off-dark, var(--thumb, var(--bg-d, #aaa)));
		--slider-off: var(--slider-off-dark, var(--slider, var(--bg-c, #333)));
		--outline: var(--outline-dark, var(--slider, var(--bg-c, #333)));
		--outline-focus: var(--outline-focus-dark, var(--bg-c, #333));

		.slider {
			box-shadow:
				-1px 1.5px 0.3rem rgba(0, 0, 0, 0.5) inset,
				0px 0.5px 0.1rem rgba(0, 0, 0, 0.5) inset;
		}
	}

	/* Switch Container */

	.switch {
		position: relative;
		display: inline-block;

		width: var(--width);
		height: var(--height);
		max-width: 100%;
		max-height: 100%;

		cursor: pointer;
		// overflow: hidden;
		&.disabled {
			cursor: not-allowed;
		}
	}

	/* Slider */

	.slider {
		background-color: var(--slider-off);
		outline-color: var(--outline, var(--slider));

		position: absolute;
		inset: 0;

		max-width: 100%;
		max-height: 100%;

		outline-width: 1.5px;
		outline-style: solid;
		border-radius: var(--slider-radius);
		box-shadow:
			-1px 1px 0.33rem rgba(0, 0, 0, 0.33) inset,
			0px 1px 0.1rem rgba(0, 0, 0, 0.33) inset;

		cursor: pointer;
		transition:
			var(--transition),
			outline 0.15s;

		overflow: hidden;

		&.disabled {
			pointer-events: none;
			opacity: 0.33;
			cursor: not-allowed;
		}
	}

	input:focus + .slider {
		&:not(:active) {
			outline-color: var(--outline-focus);
			outline-width: 2px;
		}
	}

	/* Slider Thumb */

	#{$thumb} {
		background-color: var(--thumb-off);

		content: '';
		position: absolute;
		left: var(--padding);
		bottom: var(--padding);

		width: var(--thumb-size);
		height: calc(var(--thumb-size) * var(--thumb-ratio));
		max-width: 100%;
		max-height: 100%;

		box-shadow:
			0.3px 1px 0 rgba(var(--bg-d-rgb, rgb(1, 1, 1)), 0.5),
			-0.3px 0.3px 0.1px rgba(var(--fg-d-rgb, rgb(255, 255, 255)), 0.25) inset,
			-1px 1px 1px rgba(var(--fg-d-rgb, rgb(200, 200, 200)), 0.1) inset,
			0px -1px 0.1px rgba(1, 1, 1, 0.1) inset;

		border-radius: var(--thumb-radius);

		transition: var(--transition);
	}

	/* Slider Thumb Content */

	.on,
	.off {
		position: absolute;
		top: 0;
		bottom: 0;
		left: calc(var(--padding) / 2.25);

		display: flex;
		align-items: center;
		justify-content: center;

		width: var(--thumb-size);
		height: calc(var(--thumb-size) * var(--thumb-ratio));
		max-width: 100%;
		max-height: 100%;
		margin: auto;
		padding-left: var(--padding);

		&.thumb-content {
			opacity: 0;
		}

		user-select: none;
		pointer-events: none;
		transform: translateX(0);
		transition:
			opacity 0.2s ease-out,
			transform var(--transition);
	}

	/* Checked */

	input:checked + .slider {
		background-color: var(--slider-on);
	}
	input:checked + #{$thumb} {
		background-color: var(--thumb-on);

		transform: translateX(var(--transform));
		// box-shadow: -0.3px 1px 0 rgba(var(--bg-d-rgb, rgb(255, 255, 255)), 0.5);
	}

	button:has(input:checked) {
		.on {
			&.thumb-content {
				opacity: 1;
				transform: translateX(var(--transform));
			}

			&.slider-content {
				transform: translateX(0);
			}
		}

		.off {
			&.thumb-content {
				opacity: 0;
				transform: translateX(var(--transform));
			}

			&.slider-content {
				transform: translateX(calc(var(--transform) * 2));
			}
		}
	}

	/* Unchecked */

	button:has(input:not(:checked)) {
		.on {
			&.thumb-content {
				opacity: 0;
				transform: translateX(0);
			}

			&.slider-content {
				opacity: 1;
				// transform: translateX(var(--transform));
				transform: translateX(0);
				transform: translateX(calc(var(--transform) * -1));
			}
		}

		.off {
			&.thumb-content {
				opacity: 1;
				transform: translateX(0);
			}

			&.slider-content {
				opacity: 1;
				transform: translateX(var(--transform));
			}
		}
	}

	/* Hide default HTML checkbox. */

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}
</style>
