/**
 * Detects the current operating system.
 */
export function getOS(request?: Request): 'mac' | 'windows' | 'linux' | 'android' | 'ios' {
	if (isIOS(request)) return 'ios'
	if (isAndroid(request)) return 'android'
	if (isMac(request)) return 'mac'
	if (isWindows(request)) return 'windows'
	if (isLinux(request)) return 'linux'
	throw new Error('Unknown platform')
}

/**
 * Detects the current browser.
 */
export function getBrowser(request?: Request): 'chrome' | 'firefox' | 'safari' | 'other' {
	if (isChrome(request) || isEdge(request)) return 'chrome'
	if (isFirefox(request)) return 'firefox'
	if (isSafari(request)) return 'safari'
	return 'other'
}

/**
 * Resolves the user agent string.  On the server, the request object must be provided.
 * @param request - The request object. If not provided, the global `navigator` object is returned.
 */
export function getUserAgent(request?: Request) {
	return request?.headers.get('user-agent') || globalThis.navigator?.userAgent
}

/**
 *
 */
export function isPlatform(platform: RegExp, request?: Request) {
	const ua = getUserAgent(request)
	return !!ua?.match(platform)
}

/**
 * Detects if the current browser is a webview. The request parameter is required on the server.
 * @param request - The request object. If not provided, the global `navigator` object is used.
 */
export function isWebview(request?: Request) {
	const ua = getUserAgent(request)
	if (ua) {
		console.error('Error detecting webview: request object not provided on server-side')
		return false
	}

	return !!ua.match(/webview|wv|ip((?!.*Safari)|(?=.*like Safari))/i)
}

/**
 * `true` if the current browser is running on MacOS.
 */
export function isMac(request?: Request) {
	// return plat(/mac/i)
	return isPlatform(/mac/i, request)
}

/**
 * `true` if the current browser is running on Windows.
 */
export function isWindows(request?: Request) {
	// return plat(/win/i)
	return isPlatform(/win/i, request)
}

/**
 * `true` if the current browser is running on Linux.
 */
export function isLinux(request?: Request) {
	// return plat(/linux/i)
	return isPlatform(/linux/i, request)
}

/**
 * `true` if the current browser is running on Android.
 */
export function isAndroid(request?: Request) {
	// return plat(/android/i)
	return isPlatform(/android/i, request)
}

/**
 * `true` if the current browser is running on iOS.
 */
export function isIOS(request?: Request) {
	// return plat(/iphone|ipad/i)
	return isPlatform(/iphone|ipad/i, request)
}

/**
 * `true` if the current browser is running on a mobile device.
 */
export function isMobile(request?: Request) {
	return isAndroid(request) || isIOS(request)
}

/**
 * `true` if the current browser is running on an iPad.
 */
export function isPad(request?: Request) {
	return (
		isSafari(request) &&
		!isIOS(request) &&
		'maxTouchPoints' in globalThis.navigator &&
		globalThis.navigator.maxTouchPoints > 1
	)
}

/**
 * Returns the `metaKey` on Mac, and `ctrlKey` on other platforms.
 */
export function metaKey(request?: Request) {
	return isMac(request) ? 'metaKey' : 'ctrlKey'
}

/**
 * `true` if the current browser is running on Safari.
 */
export function isSafari(request?: Request) {
	return isPlatform(/^((?!chrome|android).)*safari/i, request)
}

/**
 * `true` if the current browser is Chrome.
 */
export function isChrome(request?: Request) {
	return isPlatform(/chrome/i, request)
}

/**
 * `true` if the current browser is Firefox.
 */
export function isFirefox(request?: Request) {
	return isPlatform(/firefox/i, request)
}

/**
 * `true` if the current browser is Edge.
 */
export function isEdge(request?: Request) {
	return isPlatform(/edg/i, request)
}
