export function toCamel(str: string): string {
	if (!str) return str
	return str
		.replace(/([-_ ]+)([a-zA-Z])/g, (_, __, letter) => letter.toUpperCase())
		.replace(/^[A-Z]/, firstLetter => firstLetter.toLowerCase())
}

export function toPascal(str: string): string {
	return str.replace(/(^\w|[-_ ]\w)/g, letter => letter.toUpperCase().replace(/[-_ ]/, ''))
}

export function toSnake(str: string): string {
	return toCamel(str)
		.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
		.replace(/^_/, '')
}

export function toKebab(str: string): string {
	return toCamel(str)
		.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
		.replace(/^-/, '')
}

export function toConstant(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, '$1_$2')
		.replace(/[- ]/g, '_')
		.toUpperCase()
}

export function capitalize(str: string): string {
	if (!str) return str
	return (
		str[0].toUpperCase() +
		toCamel(str)
			.slice(1)
			.replace(/[A-Z]/g, letter => ` ${letter}`)
	)
}

const caseMap = {
	snake: toSnake,
	camel: toCamel,
	pascal: toPascal,
	kebab: toKebab,
	constant: toConstant,
	capitalized: capitalize,
} as const

type Case = keyof typeof caseMap

export function convertCase(str: string, from: Case, to: Case): string {
	// Pre-process CONSTANT_CASE input
	if (from === 'constant') {
		str = str
			.toLowerCase() // Convert the entire string to lowercase
			.replace(/_([a-z])/g, (match, p1) => ` ${p1.toUpperCase()}`) // Convert underscores to spaces and capitalize the following letter
			.trim() // Trim any leading or trailing spaces
	}

	// Now convert from the pre-processed format (or original format) to the target format
	return caseMap[to](str)
}
