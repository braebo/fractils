import { getModifierKey, type KeyData } from '$lib/utils/keys'
import * as ua from '$lib/utils/platform'

export interface PlatformInfo {
	platforms: { k: string; v: string | boolean }[]
	modifiers: { k: string; v: KeyData }[]
}

export function getInfo(request?: Request): PlatformInfo {
	return {
		platforms: [
			{ k: 'Desktop', v: ua.isDesktop(request) },
			{ k: 'Mac', v: ua.isMac(request) },
			{ k: 'Windows', v: ua.isWindows(request) },
			{ k: 'Linux', v: ua.isLinux(request) },
			{ k: 'WebView', v: ua.isWebview(request) },
			{ k: '', v: '' },
			{ k: 'Browser', v: ua.isBrowser() },
			{ k: 'Server', v: ua.isServer() },
			{ k: 'Safari', v: ua.isSafari(request) },
			{ k: 'Chrome', v: ua.isChrome(request) },
			{ k: 'Firefox', v: ua.isFirefox(request) },
			{ k: 'Edge', v: ua.isEdge(request) },
			{ k: '', v: '' },
			{ k: 'Mobile', v: ua.isMobile(request) },
			{ k: 'iOS', v: ua.isIOS(request) },
			{ k: 'iPad', v: ua.isIPad(request) },
			{ k: 'Android', v: ua.isAndroid(request) },
			{ k: '', v: '' },
		],
		modifiers: [
			{ k: 'metaKey', v: getModifierKey('metaKey', request) },
			{ k: 'altKey', v: getModifierKey('altKey', request) },
			{ k: 'ctrlKey', v: getModifierKey('ctrlKey', request) },
			{ k: 'shiftKey', v: getModifierKey('shiftKey', request) },
		],
	}
}
