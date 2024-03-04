// import { ColorPickerOptions } from './ColorPicker'

// export function cssBorderStyles(props: ColorPickerOptions) {
// 	return {
// 		boxSizing: 'border-box',
// 		border: `${props.borderWidth}px solid ${props.borderColor}`,
// 	}
// }

export type CssGradientType = 'linear' | 'radial' | 'conical'
export type CssGradientStops = [number, number | string][]

export function cssGradient(type: CssGradientType, direction: string, stops: CssGradientStops) {
	return `${type}-gradient(${direction}, ${stops.map(([o, col]) => `${col} ${o}%`).join(',')})`
}

export function cssValue(value: number | string) {
	if (typeof value === 'string') return value
	return `${value}px`
}
