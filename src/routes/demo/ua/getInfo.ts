import { getModifierKey, type KeyData } from '$lib/utils/keys'
import * as ua from '$lib/utils/platform'

export interface PlatformInfo {
	platforms: { k: string; v: string | boolean }[]
	modifiers: { k: string; v: KeyData }[]
}

export function getInfo(request?: Request): PlatformInfo {
	return {
		platforms: [
			{ k: 'Mac', v: ua.isMac(request) },
			{ k: 'Windows', v: ua.isWindows(request) },
			{ k: 'Linux', v: ua.isLinux(request) },
			{ k: '', v: '' },
			{ k: 'Safari', v: ua.isSafari(request) },
			{ k: 'Chrome', v: ua.isChrome(request) },
			{ k: 'Firefox', v: ua.isFirefox(request) },
			{ k: 'Edge', v: ua.isEdge(request) },
			{ k: '', v: '' },
			{ k: 'Mobile', v: ua.isMobile(request) },
			{ k: 'Android', v: ua.isAndroid(request) },
			{ k: 'IOS', v: ua.isIOS(request) },
			{ k: 'Pad', v: ua.isIPad(request) },
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
