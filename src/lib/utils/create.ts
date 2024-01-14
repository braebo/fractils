export function create(
	tagnameOrElement: string | HTMLElement,
	options: {
		parent?: HTMLElement
		classes?: string[]
		id?: string
		dataset?: Record<string, string>
		textContent?: string
	},
	...children: HTMLElement[]
) {
	const el =
		typeof tagnameOrElement === 'string'
			? document.createElement(tagnameOrElement)
			: tagnameOrElement

	if (options.classes) el.classList.add(...options.classes)
	if (options.id) el.id = options.id
	if (options.dataset) Object.assign(el.dataset, options.dataset)
	if (options.textContent) el.textContent = options.textContent
	if (options.parent) options.parent.appendChild(el)

	el.append(...children)

	return el
}
