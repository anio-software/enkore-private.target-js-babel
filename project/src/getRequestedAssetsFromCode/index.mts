// @ts-ignore:next-line
import _traverse from "@babel/traverse"
// @ts-ignore:next-line
import {parse} from "@babel/core"

// see https://github.com/babel/babel/issues/13855
const traverse = _traverse.default

import type {
	JsGetRequestedAssetsFromCodeResult,
	JsGetRequestedAssetsFromCodeReason
} from "./Types.mts"

import {pathResolvesToFourtuneGetAssetExport} from "./pathResolvesToFourtuneGetAssetExport.mts"
import {processCallExpression} from "./processCallExpression.mts"

export async function jsGetRequestedAssetsFromCode(
	code: string
): Promise<JsGetRequestedAssetsFromCodeResult> {
	let asset_urls: false|string[]|null = null
	let reason: JsGetRequestedAssetsFromCodeReason = "unknown"

	const ast = parse(code, {
		sourceType: "module"
	})

	traverse(ast, {
		Identifier(path: any) {
			const bindingName = path.node.name

			const tmp = pathResolvesToFourtuneGetAssetExport(path, bindingName)

			if (tmp === false) {
				return
			} else if (tmp === "unknown") {
				asset_urls = false
				path.stop()
				reason = "starImportUsed"
				return
			}

			const parentPath = path.parentPath

			if (parentPath.node.type === "ImportSpecifier") {
				return
			}

			// getAsset was used, we just don't know how
			// this is the worst case
			if (parentPath.node.type !== "CallExpression") {
				asset_urls = false
				path.stop()
				reason = "getAssetIdentifierUsed"
				return
			}

			const result = processCallExpression(parentPath)

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
