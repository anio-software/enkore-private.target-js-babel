import {jsParseAssetURL} from "../parseAssetURL.mjs"
import type {JsParseAssetURLResult} from "@fourtune/types/base-realm-js-and-web/v0/"

export function processCallExpression(
	path : any
) : JsParseAssetURLResult|false {
	if (path.node.arguments.length !== 1) {
		throw new Error(
			`getAsset() takes exactly one argument.`
		)
	}

	const url_param = path.node.arguments[0]

	if (url_param.type !== "StringLiteral") {
		return false
	}

	return jsParseAssetURL(url_param.value)
}
