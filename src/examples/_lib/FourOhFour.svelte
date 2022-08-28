<script lang="ts">
	let svg: SVGElement | undefined
	$: svgWidth = svg?.getBoundingClientRect().width

	interface TyperOptions {
		text?: string
		speed?: number
		loop?: boolean
		delay?: number
		hold?: number
		cooldown?: number
	}

	const defaultTyperOptions: TyperOptions = {
		text: '',
		speed: 1,
		loop: true,
		delay: 0,
		hold: 2000,
		cooldown: 3000,
	}

	const typer = (node: HTMLElement, options?: TyperOptions) => {
		// there must be a better way to do this
		let text = options?.text || defaultTyperOptions.text
		let speed = options?.speed || defaultTyperOptions.speed
		let loop = options?.loop || defaultTyperOptions.loop
		let delay = options?.delay || defaultTyperOptions.delay
		let hold = options?.hold || defaultTyperOptions.hold
		let cooldown = options?.cooldown || defaultTyperOptions.cooldown

		text =
			!text?.length && node.textContent
				? (text = node.textContent)
				: 'please add text to you element, or pass in "text" as an option'

		const letters = Array.from(String(text))

		let i = 0,
			timer: ReturnType<typeof setTimeout> | null = null

		function type() {
			if (i < letters.length) {
				node.textContent = letters.slice(0, i + 1).join('')
				i++
				timer = setTimeout(type, 100 * speed!)
			} else if (loop) {
				timer = setTimeout(untype, hold)
			}
		}
		function untype() {
			if (i > 0) {
				node.textContent = letters.slice(0, i - 1).join('')
				i--
				timer = setTimeout(untype, 50 * speed!)
			} else if (loop) {
				timer = setTimeout(type, cooldown)
			}
		}
		node.textContent = ''
		timer = setTimeout(type, delay)

		return {
			destroy() {
				if (timer) clearTimeout(timer)
			},
		}
	}
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	bind:this={svg}
	width="100%"
	height="100%"
	fill="none"
	viewBox="0 0 1665 644"
	preserveAspectRatio="xMinYMin meet"
>
	<defs>
		<clipPath id="terminalClipPath" class="terminalClipPath">
			<path fill="#fff" d="M 100 115 h 585 v 450 H 100 z" />
		</clipPath>
		<filter
			id="notFoundGlowFilter"
			width="441.789"
			height="180.927"
			x="612.245"
			y="248.168"
			class="filter0_d_222_7"
			color-interpolation-filters="sRGB"
			filterUnits="userSpaceOnUse"
		>
			<feFlood flood-opacity="0" result="BackgroundImageFix" />
			<feColorMatrix
				in="SourceAlpha"
				result="hardAlpha"
				values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
			/>
			<feOffset />
			<feGaussianBlur stdDeviation="37" />
			<feComposite in2="hardAlpha" operator="out" />
			<feColorMatrix values="0 0 0 0 1 0 0 0 0 0.270833 0 0 0 0 0.270833 0 0 0 1 0" />
			<feBlend in2="BackgroundImageFix" result="effect1_dropShadow_222_7" />
			<feBlend in="SourceGraphic" in2="effect1_dropShadow_222_7" result="shape" />
		</filter>
	</defs>
	<g class="Terminal404">
		<g class="TerminalGroup">
			<rect
				width="621.24"
				height="465.326"
				x="522.462"
				y="107.551"
				fill="var(--light-b, #1B1B1D)"
				class="Terminal"
				rx="15"
			/>
			<g class="TerminalButtons">
				<circle cx="541.67" cy="128.119" r="6.045" fill="#935353" class="Red" />
				<circle cx="559.963" cy="128.119" r="6.045" fill="#C5BD7A" class="Yelllow" />
				<circle cx="578.256" cy="128.119" r="6.045" fill="#8EC87A" class="Green" />
			</g>
		</g>
		<path
			fill="var(--light-b, #1B1B1D)"
			d="M415.596 469.988h-58.873v114.155h-77.18l-.359-114.155H73.488v-56.001L216.003 78.7l67.847 26.924-126.36 301.901h122.053l9.692-132.463h67.488v132.463h58.873v62.463z"
			class="L4"
		/>
		<path
			fill="var(--light-b, #1B1B1D)"
			d="M1592.42 469.988h-58.87v114.155h-77.18l-.36-114.155h-205.7v-56.001L1392.83 78.7l67.85 26.924-126.36 301.901h122.05l9.69-132.463h67.49v132.463h58.87v62.463z"
			class="R4"
		/>
		<foreignObject
			x="35%"
			y="42%"
			width="30%"
			height="100%"
			style="text-align: center; line-height: 10rem;"
		>
			<h3 class="NOT-FOUND" use:typer={{ delay: 1000 }}>NOT FOUND</h3>
		</foreignObject>
	</g>
	<foreignObject x="32%" clip-path="url(#terminalClipPath)" width="50%" height="100%">
		<pre
			clip-path="url(#terminalClipPath)"
			class="code"
			style="max-width: {(svgWidth ?? 500) *
				0.9}px;">
	findRoute(
			path: string,
			routes: any,
			parent = '',
		): string | null => &#125;
			const route = Object.keys(routes).find(key =&gt; &#125;
				const route = routes[key]
				if (route.path === path) return route.path
				if (route.children)
					return findRoute(path, route.children, route.path)
				return null
			&#123;)
			return route || null
		&#123;
	
		
		findRouteOnline(path: string): string | null =&gt; &#125;
			const route = Object.keys(routes).find(key =&gt; &#125;
				const route = routes[key]
				if (route.path === path) return route.path
				if (route.children)
					return findRouteOnline(path, route.children)
				return null
			&#123;)
			return route || null
		&#123;
		
		float Q_rsqrt( float number )
		&#125;
			long i;
			float x2, y;
			const float threehalfs = 1.5F;
		
			x2 = number * 0.5F;
			y  = number;
			i  = * ( long * ) &y;    // evil floating point bit level hacking
			i  = 0x5f3759df - ( i &gt;&gt; 1 );               // what the fuck? 
			y  = * ( float * ) &i;
			y  = y * ( threehalfs - ( x2 * y * y ) );   // 1st iteration
		//  y  = y * ( threehalfs - ( x2 * y * y ) );   // 2nd iteration,
		// this can be removed
		
			return y;
		
	</pre>
	</foreignObject>
</svg>

<style lang="scss">
	svg {
		display: flex;

		margin: min(10vh, 10rem) auto;
		width: 1000px;
		max-width: 90vw;
		aspect-ratio: 5/2;
	}
	.NOT-FOUND {
		font-family: 'fira mono';
		font-size: 3rem;

		color: #ff7171;
		text-shadow: 0 0 77px #ff717177;

		overflow: visible;
		animation: blink 2s infinite;
	}
	@keyframes blink {
		48% {
			opacity: 1;
		}
		50% {
			opacity: 0.25;
		}
		52% {
			opacity: 1;
		}
	}
	.code {
		position: relative;

		z-index: 999999;

		padding: 0.5rem;

		font-family: 'fira mono';
		font-size: 0.5rem;
		white-space: pre;

		color: #666688;
		background: transparent;
		box-shadow: none;

		animation: scroll 4s ease-in infinite;

		clip-path: url('#terminalClipPath');
	}

	@keyframes scroll {
		0% {
			transform: translateY(100%);
		}
		50% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(-100%);
		}
	}
</style>
