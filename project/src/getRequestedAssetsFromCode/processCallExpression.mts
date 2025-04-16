import type {JsParseAssetURLResult} from "./Types.mts"

export function processCallExpression(
	path: any
): JsParseAssetURLResult|false {
	if (path.node.arguments.length !== 1) {
		throw new Error(
			`getAsset() takes exactly one argument.`
		)
	}

	const url_param = path.node.arguments[0]

	if (url_param.type !== "StringLiteral") {
		return false
	}

	return url_param.value
}
