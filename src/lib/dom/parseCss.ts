// export function parseCss(template: TemplateStringsArray, ...args: any[]): Record<string, string> {
// 	const result: Record<string, string> = {}

// 	// Concatenate the template strings and interpolated values
// 	const cssString = template.reduce((acc, str, i) => acc + str + (args[i] || ''), '')

// 	// Remove comments and split the CSS string into individual rules
// 	const rules = cssString
// 		.replace(/\/\*[\s\S]*?\*\//g, '')
// 		.trim()
// 		.split(';')
// 		.map(rule => rule.trim())

// 	// Parse each rule and add it to the result object
// 	for (const rule of rules) {
// 		if (rule) {
// 			const [property, value] = rule.split(':').map(part => part.trim())
// 			result[property] = value
// 		}
// 	}

// 	return result
// }
