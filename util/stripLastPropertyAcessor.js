'use babel'
export default function stripLastPropertyAcessor (path) {
	if (path[path.length - 1] === ']') {
		return path.substring(0, path.lastIndexOf('['))
	} else {
		return path.substring(0, path.lastIndexOf('.'))
	}
}
