export function addClass(nodes: Element | Element[], classes: string | string[]) {
	if (!Array.isArray(nodes)) nodes = [nodes]
	if (!Array.isArray(classes)) classes = [classes]

	for (const node of nodes) {
		for (const cls of classes) {
			node.classList.add(cls)
		}
	}
}

export function removeClass(nodes: Element | Element[], classes: string | string[]) {
	if (!Array.isArray(nodes)) nodes = [nodes]
	if (!Array.isArray(classes)) classes = [classes]

	for (const node of nodes) {
		for (const cls of classes) {
			node.classList.remove(cls)
		}
	}
}
