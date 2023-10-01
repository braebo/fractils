/**
 * Checks if the current browser is a potato (Safari).
 */
export const isSafari =
	typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator?.userAgent);

/**
 * Helper function to deal with the flaming hot pile of garbage that is Safari.
 * @param any Something cool (and standards compliant).
 * @returns A less cool (safari compatible) thing if safari is detected, otherwise the cool thing.
 */
export function maybeCoolThing<CoolThing, LessCoolThing>(a: CoolThing, b: LessCoolThing) {
	return isSafari ? b : a;
}
