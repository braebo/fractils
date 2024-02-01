<script>
	import { fly } from 'svelte/transition'
	import { OnMount, scrollY } from '$lib'

	export let menuOpen = false

	let intro = true

	const handleClick = () => {
		intro = false
		menuOpen = !menuOpen
	}

	$: scrolled = $scrollY > 100
</script>

<div class="burger" on:pointerdown={handleClick} class:scrolled out:fly|global={{ x: 75 }} class:menuOpen>
	<OnMount>
		{#key menuOpen}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 101 101"
				overflow="visible"
				height="100%"
				width="100%"
			>
				<path
					class="TopBun"
					class:menuOpen
					class:intro
					stroke="#ffffff"
					stroke-width="5"
					stroke-linecap="round"
					d="M24.238 31.748h52.524"
				/>
				<path
					fill="none"
					class="Patty"
					class:menuOpen
					class:intro
					stroke="#ffffff"
					stroke-width="5"
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M24.238 50.5h66.788c0 22.473-18.465 40.802-40.97 40.532-22.238-.267-39.973-18.293-40-40.532a40.39 40.39 0 0140-40.537c22.36-.269 40.703 17.544 40.97 39.903"
				/>
				<path
					class:menuOpen
					class:intro
					stroke="#ffffff"
					stroke-width="5"
					class="BottomBun"
					stroke-linecap="round"
					d="M24.238 69.252h52.524"
				/>
			</svg>
		{/key}
	</OnMount>
</div>

<style lang="scss">
	svg {
		--openDelay: 0s;
		--openDur: 0.5s;

		--closeDelay: 0.25s;
		--closeDur: 0.5s;

		--pattyDur: 0.75s;
		--bunDur: 0.5s;
	}
	.burger {
		position: fixed;
		z-index: 20;
		bottom: 0.5rem;
		right: 1rem;

		width: 50px;
		height: 50px;
		padding: 5px;
		margin: auto;

		border-radius: 100%;

		background: var(--bg-a);

		cursor: pointer;
		transition: box-shadow 0.2s;

		&.scrolled {
			box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.25);
		}
		&.menuOpen {
			pointer-events: none;
		}
	}

	.Patty {
		animation: var(--pattyDur) forwards reverse open;
		stroke-dashoffset: -66.9;
		stroke-dasharray: 259, 1000;
	}
	.Patty.menuOpen {
		opacity: 0.5;

		animation: var(--pattyDur) forwards open;
	}

	@keyframes open {
		0% {
			stroke-dashoffset: 247;
			stroke-dasharray: 300, 1000;

			opacity: 1;
		}
		40% {
			stroke-dashoffset: -67;
			stroke-dasharray: 0, 1000;

			opacity: 1;
		}
		100% {
			stroke-dashoffset: -66.9;
			stroke-dasharray: 259, 1000;

			opacity: 0.25;
		}
	}

	.TopBun {
		transform-origin: 25% 40%;
		animation: var(--openDur) cubic-bezier(0.5, 0, 1, 0.5) var(--openDelay) reverse forwards
			openTop;
		transform: rotate(45deg);
	}
	.BottomBun {
		transform-origin: 30% 60%;
		animation: var(--openDur) cubic-bezier(0.5, 0, 1, 0.5) var(--openDelay) reverse forwards
			openBottom;
		transform: rotate(-45deg);
	}

	.TopBun.menuOpen {
		animation: var(--closeDur) cubic-bezier(0, 0.51, 0.37, 1.02) var(--closeDelay) forwards
			openTop;
		transform: rotate(0deg);
	}
	.BottomBun.menuOpen {
		animation: var(--closeDur) cubic-bezier(0, 0.51, 0.37, 1.02) var(--closeDelay) forwards
			openBottom;
		transform: rotate(0deg);
	}

	@keyframes openTop {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(45deg);
		}
	}
	@keyframes openBottom {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(-45deg);
		}
	}

	.intro {
		opacity: 0;

		animation: cubic-bezier(0.785, 0.135, 0.15, 0.86) 1s forwards intro;
	}

	.TopBun.intro {
		animation-duration: 1.25s;
		animation-delay: 0.2s;
	}
	.Patty.intro {
		stroke-dashoffset: 247;
		stroke-dasharray: 300, 1000;

		animation-duration: 1s;
		animation-delay: 0.1s;
	}
	.BottomBun.intro {
		animation-duration: 0.75s;
	}

	@keyframes intro {
		from {
			opacity: 0;

			transform: translateX(100px);
		}
		to {
			opacity: 1;

			transform: translateY(0px);
		}
	}
</style>
