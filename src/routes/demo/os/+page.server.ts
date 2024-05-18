import { getInfo } from './getInfo.js'

export const load = ({ request }) => {
	return {
		info: getInfo(request),
	}
}
