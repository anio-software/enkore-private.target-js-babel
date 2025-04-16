// @ts-ignore:next-line
import _traverse from "@babel/traverse"
// @ts-ignore:next-line
import {parse} from "@babel/core"

// see https://github.com/babel/babel/issues/13855
const traverse = _traverse.default

import type {
	JsParseAssetURLResult,
	JsGetRequestedAssetsFromCodeResult,
	JsGetRequestedAssetsFromCodeReason
} from "@fourtune/types/base-realm-js-and-web/v0/"

import {pathResolvesToFourtuneGetAssetExport} from "./pathResolvesToFourtuneGetAssetExport.mjs"
import {processCallExpression} from "./processCallExpression.mjs"

export async function jsGetRequestedAssetsFromCode(
	code : string
) : Promise<JsGetRequestedAssetsFromCodeResult> {
	let asset_urls : false|JsParseAssetURLResult[]|null = null
	let reason : JsGetRequestedAssetsFromCodeReason = "unknown"

	const ast = parse(code, {
		sourceType: "module"
	})

	traverse(ast, {
		Identifier(path : any) {
			const binding_name = path.node.name

			const tmp = pathResolvesToFourtuneGetAssetExport(path, binding_name)

			if (tmp === false) {
				return
			} else if (tmp === "unknown") {
				asset_urls = false
				path.stop()
				reason = "starImportUsed"
				return
			}

			const parent_path = path.parentPath

			if (parent_path.node.type === "ImportSpecifier") {
				return
			}

			// getAsset was used, we just don't know how
			// this is the worst case
			if (parent_path.node.type !== "CallExpression") {
				asset_urls = false
				path.stop()
				reason = "getAssetIdentifierUsed"
				return
			}

			const result = processCallExpression(parent_path)

			// we don't know what this call to getAsset is requesting
			if (result === false) {
				asset_urls = false
				path.stop()
				reason = "getAssetDynamicURL"
				return
			}

			if (asset_urls === false) {
				throw new Error(`Shouldn't be able to be here.`)
			}

			if (asset_urls === null) {
				asset_urls = []
			}

			asset_urls.push(result)
		}
	})

	// no assets were used
	if (asset_urls === null) {
		return {
			used: false,
			assets: null
		}
	}

	// we know assets were used but don't know
	// which ones (worst case)
	if (asset_urls === false) {
		return {
			used: true,
			assets: "unknown",
			reason
		}
	}

	return {
		used: true,
		assets: asset_urls
	}
}
