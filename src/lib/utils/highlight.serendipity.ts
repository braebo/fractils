import type { ThemeInput } from 'shikiji/core'

/**
 * The default shikiji theme for `highlight`.
 * @internal
 */
export const serendipity: ThemeInput = {
	name: 'serendipity',
	type: 'dark',
	colors: {
		'editor.background': '#0000',
		'editor.foreground': '#d4d4d4',
	},
	settings: [
		{
			name: 'Global settings',
			settings: {
				background: '#15161d',
				foreground: '#777d8f',
			},
		},
		{
			scope: ['comment'],
			settings: {
				foreground: '#6B6D7C',
				fontStyle: 'italic',
			},
		},
		{
			scope: ['constant'],
			settings: {
				foreground: '#5ba2d0',
			},
		},
		{
			scope: ['constant.numeric', 'constant.language', 'constant.charcter.escape'],
			settings: {
				foreground: '#F8D2C9',
			},
		},
		{
			scope: ['entity.name'],
			settings: {
				foreground: '#F8D2C9',
			},
		},
		{
			scope: [
				'entity.name.section',
				'entity.name.tag',
				'entity.name.namespace',
				'entity.name.type',
			],
			settings: {
				foreground: '#94b8ff',
			},
		},
		{
			scope: ['entity.other.attribute-name', 'entity.other.inherited-class'],
			settings: {
				foreground: '#9ccfd8',
				fontStyle: 'italic',
			},
		},
		{
			scope: ['invalid'],
			settings: {
				foreground: '#ee8679',
			},
		},
		{
			scope: ['invalid.deprecated'],
			settings: {
				foreground: '#8D8F9E',
			},
		},
		{
			scope: ['keyword'],
			settings: {
				foreground: '#5ba2d0',
			},
		},
		{
			scope: ['meta.tag', 'meta.brace'],
			settings: {
				foreground: '#DEE0EF',
			},
		},
		{
			scope: ['meta.import', 'meta.export'],
			settings: {
				foreground: '#5ba2d0',
			},
		},
		{
			scope: 'meta.directive.vue',
			settings: {
				foreground: '#9ccfd8',
				fontStyle: 'italic',
			},
		},
		{
			scope: 'meta.property-name.css',
			settings: {
				foreground: '#94b8ff',
			},
		},
		{
			scope: 'meta.property-value.css',
			settings: {
				foreground: '#a78bfa',
			},
		},
		{
			scope: 'meta.tag.other.html',
			settings: {
				foreground: '#8D8F9E',
			},
		},
		{
			scope: ['punctuation'],
			settings: {
				foreground: '#8D8F9E',
			},
		},
		{
			scope: ['punctuation.accessor'],
			settings: {
				foreground: '#5ba2d0',
			},
		},
		{
			scope: ['punctuation.definition.string'],
			settings: {
				foreground: '#a78bfa',
			},
		},
		{
			scope: ['punctuation.definition.tag'],
			settings: {
				foreground: '#6B6D7C',
			},
		},
		{
			scope: ['storage.type', 'storage.modifier'],
			settings: {
				foreground: '#5ba2d0',
			},
		},
		{
			scope: ['string'],
			settings: {
				foreground: '#a78bfa',
			},
		},
		{
			scope: ['support'],
			settings: {
				// "foreground": "#94b8ff"
				// "foreground": "#ffcc8b"
				foreground: '#F8D2C9',
			},
		},
		{
			scope: ['support.constant'],
			settings: {
				foreground: '#a78bfa',
			},
		},
		{
			scope: ['support.function'],
			settings: {
				foreground: '#ee8679',
				fontStyle: 'italic',
			},
		},
		{
			scope: ['variable'],
			settings: {
				foreground: '#F8D2C9',
				// "fontStyle": "italic"
			},
		},
		{
			scope: [
				'variable.other',
				'variable.language',
				'variable.function',
				'variable.argument',
			],
			settings: {
				foreground: '#DEE0EF',
			},
		},
		{
			scope: ['variable.parameter'],
			settings: {
				foreground: '#9ccfd8',
			},
		},
		// Dim template tags
		{
			scope: [
				'punctuation.definition.tag',
				'entity.name.tag.svelte',
				'punctuation.separator.key-value.svelte',
				'constant.name.attribute.tag.pug',
			],
			settings: {
				// "foreground": "#5a86ff36"
				foreground: '#777d8f',
			},
		},

		// Dim semicolons
		{
			scope: ['punctuation.terminator'],
			settings: {
				foreground: '#777d8f',
			},
		},

		// Dim svelte parens in script tag, i.e. - `const x = (a || b) <--`
		{
			scope: ['meta.embedded.block.svelte'],
			settings: {
				foreground: '#777d8f',
			},
		},

		// // Dim svelte parens in script tag, i.e. - `const x = (a || b) <--`
		// {
		// 	"scope": ["variable.other.readwrite.js"],
		// 	"settings": {
		// 		"foreground": "#f00"
		// 	}
		// }
	],
}
