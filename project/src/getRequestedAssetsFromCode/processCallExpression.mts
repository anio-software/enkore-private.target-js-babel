import type {JsParseAssetURLResult} from "./Types.mts"

export function processCallExpression(
	path: any
): JsParseAssetURLResult|false {
	if (path.node.arguments.length !== 1) {
		throw new Error(
			`getAsset() takes exactly one argument.`
		)
	}

	const urlParam = path.node.arguments[0]

	if (urlParam.type !== "StringLiteral") {
		return false
	}

	return urlParam.value
}
