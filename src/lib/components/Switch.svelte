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
	interface $$Events {
		/** Toggles the switch. */
		click: MouseEvent
	}

	interface $$Props {
		on?: string
		off?: string
		title?: string
		checked?: boolean
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

	/** The content to display when the switch is on. */
	export let on = ''
	/** The content to display when the switch is off. */
	export let off = ''
	/** Visible to screen readers / tooltips. */
	export let title = ''
	/** Whether the switch is checked or not. */
	export let checked = false
</script>

<label class="switch" {title}>
	<input type="checkbox" bind:checked on:click />
	<span class="slider round" />
	<span class="on" aria-hidden="true">{on}</span>
	<span class="off" aria-hidden="true">{off}</span>
</label>

<style lang="scss">
	.switch {
		--width: var(--switch-width, 3rem);
		--padding: var(--switch-padding, 0.2rem);
		--accent: var(--switch-accent, #2196f3);
		--thumb-size: var(--switch-thumb-size, 1.25rem);
		--thumb-ratio: var(--switch-thumb-ratio, 1);
		--slider-radius: var(--switch-slider-radius, 1.25rem);
		--thumb-radius: var(--switch-thumb-radius, 1rem);

		--outline: var(--switch-outline, var(--accent));

		--primary: var(--switch-primary, var(--bg-a, white));
		--secondary: var(--switch-secondary, var(--bg-c, lightgray));

		--primary-dark: var(--switch-primary, var(--bg-a, white));
		--secondary-dark: var(--switch-secondary, var(--bg-c, lightgray));

		--primary-on: var(--switch-primary-on, var(--primary));
		--secondary-on: var(--switch-secondary-on, var(--accent));
		--primary-on-dark: var(--switch-primary-on-dark, var(--primary));
		--secondary-on-dark: var(--switch-secondary-on-dark, var(--accent));

		--primary-off: var(--switch-primary-off, var(--primary));
		--secondary-off: var(--switch-secondary-off, var(--secondary));
		--primary-off-dark: var(--switch-primary-off-dark, var(--primary));
		--secondary-off-dark: var(--switch-secondary-off-dark, var(--secondary));

		--height: calc(var(--thumb-size) * var(--thumb-ratio) + var(--padding) * 2);
		--transition: 0.4s cubic-bezier(0.29, 0.68, 0.29, 0.96);
		/* prettier-ignore */
		--transform: translateX(
		calc(
			var(--width) -
			var(--thumb-size) -
			var(--padding) *
			2
		)
	);
	}

	:global(:root[theme='dark'] .switch) {
		--primary: var(--primary-dark, var(--primary, var(--bg-d, #aaa)));
		--secondary: var(--secondary-dark, var(--secondary, var(--bg-b, #333)));
		--primary-on: var(--primary-on-dark, var(--primary, var(--bg-d, #aaa)));
		--secondary-on: var(--secondary-on-dark, var(--accent, var(--bg-b, #333)));
		--primary-off: var(--primary-off-dark, var(--primary, var(--bg-d, #aaa)));
		--secondary-off: var(--secondary-off-dark, var(--secondary, var(--bg-b, #333)));
	}

	$thumb: '.slider:before';

	/* Switch Container */

	.switch {
		position: relative;
		display: inline-block;

		width: var(--width);
		height: var(--height);
		max-width: 100%;
		max-height: 100%;

		cursor: pointer;
	}

	/* Slider */

	.slider {
		position: absolute;
		inset: 0;

		max-width: 100%;
		max-height: 100%;

		background-color: var(--secondary-off);
		outline: 2px solid transparent;
		box-shadow:
			-1px 1px 0.3rem rgba(0, 0, 0, 0.5) inset,
			0px 1px 0.1rem rgba(0, 0, 0, 0.5) inset;

		outline-width: 1px;
		outline-style: solid;
		border-radius: var(--slider-radius);

		cursor: pointer;
		transition: var(--transition);
	}

	input:focus + .slider {
		outline-color: var(--outline);
	}

	/* Slider Thumb */

	#{$thumb} {
		content: '';
		position: absolute;
		left: var(--padding);
		bottom: var(--padding);

		width: var(--thumb-size);
		height: calc(var(--thumb-size) * var(--thumb-ratio));
		max-width: 100%;
		max-height: 100%;

		background-color: var(--primary-off);
		box-shadow:
			0.3px 1px 0 rgba(var(--bg-d-rgb, rgb(1, 1, 1)), 0.5),
			-0.3px 0.3px 0.1px rgba(var(--fg-d-rgb, rgb(200, 200, 200)), 0.1) inset,
			-1px 1px 1px rgba(var(--fg-d-rgb, rgb(200, 200, 200)), 0.1) inset,
			1px -1px 0.15px rgba(var(--bg-a-rgb, rgb(1, 1, 1)), 0.1) inset;

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

		opacity: 0;

		user-select: none;
		pointer-events: none;
		transform: translateX(0);
		transition:
			opacity 0.2s ease-out,
			transform var(--transition);
	}

	/* Checked - On */

	input:checked + .slider {
		background-color: var(--secondary-on);
	}
	input:checked + #{$thumb} {
		transform: var(--transform);
		box-shadow: -0.3px 1px 0 rgba(var(--bg-d-rgb, rgb(255, 255, 255)), 0.5);
		background-color: var(--primary-on);
	}

	label:has(input:checked) {
		.on {
			opacity: 1;
			transform: var(--transform);
		}

		.off {
			opacity: 0;
			transform: var(--transform);
		}
	}

	/* Unchecked - Off */

	label:has(input:not(:checked)) {
		.on {
			opacity: 0;
			transform: translateX(0);
		}

		.off {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* Hide default HTML checkbox. */
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}
</style>
