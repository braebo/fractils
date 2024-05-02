// import type { PropertiesHyphen } from 'csstype'

// // Define a class decorator factory that accepts custom properties
// function Element<TCustomProperties extends string>() {
// 	// Actual decorator function
// 	return function <T extends { new (...args: any[]): {} }>(constructor: T) {
// 		return class extends constructor {
// 			element: HTMLElement

// 			// Method to set a single property
// 			setProp<K extends keyof PropertiesHyphen | TCustomProperties>(
// 				prop: K,
// 				value: string,
// 			): void {
// 				this.element.style.setProperty(prop, value)
// 			}

// 			// Method to set multiple properties
// 			setProps(
// 				props: Partial<Record<keyof PropertiesHyphen | TCustomProperties, string>>,
// 			): void {
// 				Object.entries(props).forEach(([key, value]) => {
// 					this.element.style.setProperty(key, value)
// 				})
// 			}
// 		}
// 	}
// }

// // // Example usage

// // @Element<'--foo' | '--bar'>()
// // class MyComponent {
// // 	element: HTMLElement

// // 	constructor(element: HTMLElement) {
// // 		this.element = element
// // 	}
// // }

// // // Using the enhanced class
// // const component = new MyComponent(document.createElement('div'))
// // component.setProps({ '--foo': '1rem', color: 'red' })
// // component.setProp('--bar', '2rem')
