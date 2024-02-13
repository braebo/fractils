export function create<T extends HTMLElement = HTMLElement>(
	tagnameOrElement: string | HTMLElement,
	options: {
		parent?: HTMLElement
		classes?: string[]
		id?: string
		dataset?: Record<string, string>
		textContent?: string
		cssText?: string
		[key: string]: any
	},
	...children: HTMLElement[]
) {
	const el =
		typeof tagnameOrElement === 'string'
			? document.createElement(tagnameOrElement)
			: tagnameOrElement

	const { parent, classes, id, dataset, textContent, cssText, ...rest } = options

	if (classes) el.classList.add(...classes)
	if (id) el.id = id
	if (dataset) Object.assign(el.dataset, dataset)
	if (textContent) el.textContent = textContent
	if (parent) parent.appendChild(el)
	if (cssText) el.style.cssText = cssText

	if (rest) {
		for (const [key, value] of Object.entries(rest)) {
			el[key] = value
		}
	}

	el.append(...children)

	return el as unknown as T
}
