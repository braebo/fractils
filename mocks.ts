import { mockResizeObserver, mockAnimationsApi, mockViewport } from 'jsdom-testing-mocks'

mockResizeObserver()
mockAnimationsApi()
mockViewport({
	width: 1024,
	height: 768,
})
