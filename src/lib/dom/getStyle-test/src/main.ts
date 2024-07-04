import './style.css'

const element = document.createElement('div')
document.body.appendChild(element)

const getStyleForLoop = (element: Element) => {
	const styles = getComputedStyle(element)
	const styleMap = new Map()

	for (let i = 0; i < styles.length; i++) {
		const property = styles[i]
		const value = styles.getPropertyValue(property)
		if (value) {
			styleMap.set(property, value)
		}
	}

	return styleMap
}

const getStyleForOfLoop = () => {
	const styles = getComputedStyle(element)
	const styleMap = new Map()

	for (const property of styles) {
		const value = styles[property as keyof CSSStyleDeclaration]
		if (value) {
			styleMap.set(property, value)
		}
	}

	return styleMap
}

const runs = [
	{
		name: 'for loop',
		fn: (element: Element) => getStyleForLoop(element),
	},
	{
		name: 'for...of loop',
		fn: () => getStyleForOfLoop(),
	},
	{
		name: 'computedStyleMap',
		fn: (element: Element) => {
			const x = element.computedStyleMap()
			return x
		},
	},
	{
		name: 'getStyle',
		fn: (element: Element) => {
			if ('computedStyleMap' in element) {
				const x = element.computedStyleMap()
				return x
			} else {
				const styles = getComputedStyle(element)
				const styleMap = new Map<string, string>()
				for (let i = 0; i < styles.length; i++) {
					const property = styles[i]
					const value = styles.getPropertyValue(property)
					if (value) {
						styleMap.set(property, value)
					}
				}
				return styleMap
			}
		},
	},
	{
		name: 'map[prop]',
		fn: (element: Element) => {
			const styles = getComputedStyle(element)
			const styleMap = new Map()

			for (const property of styles) {
				const value = styles[property as keyof CSSStyleDeclaration]
				if (value) {
					styleMap.set(property, value)
				}
			}

			return styleMap
		},
	},
	{
		name: 'getComputedStyle',
		fn: (element: Element) => {
			const styles = getComputedStyle(element)
			return styles
		},
	},
]

const iters = 100

const results = [] as { name: string; time: number }[]
for (const run of runs) {
	const start = performance.now()

	for (let i = 0; i < iters; i++) {
		const element = document.createElement('div')
		document.body.appendChild(element)
		run.fn(element)
		element.remove()
	}

	const end = performance.now() - start
	results.push({ name: run.name, time: atLeast1(end) })
}

console.table(
	results.sort((a, b) => a.time - b.time).map(({ name, time }) => ({ name, time: time })),
)

const height = window.innerHeight / 2
const winner = results.reduce((a, b) => (a.time < b.time ? a : b))
const loser = results.reduce((a, b) => (a.time > b.time ? a : b))

function atLeast1(n: number) {
	if (n === Infinity || n <= 0) {
		return 1
	}
	return n
}
function relativeScore(time: number) {
	const r = loser.time / time
	return atLeast1(r)
}

const section = document.createElement('section')
document.body.appendChild(section)
section.style.cssText = `
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-evenly;
	align-items: flex-start;
	width: 100%;
	height: 100vh;
`

console.log('winner:', winner.time, winner.name)
console.log('loser:', loser.time, loser.name)

for (const result of results) {
	const { name, time } = result
	const score = relativeScore(result.time)

	const containerEl = document.createElement('div')
	containerEl.style.cssText = `
		justify-content: center;
		margin: 1rem;
	`

	const titleEl = document.createElement('h1')
	titleEl.style.cssText = `
		font-size: 1.75rem;
	`
	titleEl.textContent = name
	containerEl.appendChild(titleEl)

	const timeEl = document.createElement('h3')
	timeEl.textContent = time.toString() + 'ms' + score
	containerEl.appendChild(timeEl)
	console.log({ score, time: time })

	const timesSlowerEl = document.createElement('p')

	if (winner.time === time || time === 1) {
		timesSlowerEl.textContent = '⭐️'
	} else {
		timesSlowerEl.textContent = `-${(time / winner.time).toFixed(2)}x`
	}

	containerEl.appendChild(timesSlowerEl)

	const hue = mapRange(time, loser.time, winner.time, 0, 100)

	const progressbar = document.createElement('div')
	progressbar.style.cssText = `
		font-family: sans-serif;
		font-size: 1rem;
		height: ${time === 1 ? 3 : height / score}px;
		width: 100px;
		background: hsl(${hue}, 100%, 50%);
		margin-right: auto;
		color: black;
		font-weight: bold;
	`
	containerEl.appendChild(progressbar)

	section.appendChild(containerEl)

	console.log(name, score)
}

console.log(results)

function mapRange(value: number, low1: number, high1: number, low2: number, high2: number) {
	return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)
}
