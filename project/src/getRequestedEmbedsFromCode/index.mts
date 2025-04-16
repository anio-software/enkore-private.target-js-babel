// @ts-ignore:next-line
import _traverse from "@babel/traverse"
// @ts-ignore:next-line
import {parse} from "@babel/core"

// see https://github.com/babel/babel/issues/13855
const traverse = _traverse.default

import type {
	RequestedEmbedsFromCodeResult,
	ReasonWhyUnknown
} from "./Types.mts"

import {pathResolvesToGetEmbedExport} from "./pathResolvesToGetEmbedExport.mts"
import {processCallExpression} from "./processCallExpression.mts"

export async function getRequestedEmbedsFromCode(
	enkoreProjectModuleSpecifiers: string[],
	enkoreProjectModuleGetEmbedProperties: string[],
	code: string
): Promise<RequestedEmbedsFromCodeResult> {
	let requestedEmbeds: false|string[]|null = null
	let reasonWhyUnknown: ReasonWhyUnknown = "unknown"

	const ast = parse(code, {
		sourceType: "module"
	})

	traverse(ast, {
		Identifier(path: any) {
			const bindingName = path.node.name

			const tmp = pathResolvesToGetEmbedExport(
				enkoreProjectModuleSpecifiers,
				enkoreProjectModuleGetEmbedProperties,
				path,
				bindingName
			)

			if (tmp === false) {
				return
			} else if (tmp === "unknown") {
				requestedEmbeds = false
				path.stop()
				reasonWhyUnknown = "starImportUsed"
				return
			}

			const parentPath = path.parentPath

			if (parentPath.node.type === "ImportSpecifier") {
				return
			}

			// getEmbed was used, we just don't know how
			// this is the worst case
			if (parentPath.node.type !== "CallExpression") {
				requestedEmbeds = false
				path.stop()
				reasonWhyUnknown = "getEmbedIdentifierUsed"
				return
			}

			const result = processCallExpression(parentPath)

			// we don't know what this call to getEmbed is requesting
			if (result === false) {
				requestedEmbeds = false
				path.stop()
				reasonWhyUnknown = "getEmbedDynamicURL"
				return
			}

			if (requestedEmbeds === false) {
				throw new Error(`Shouldn't be able to be here.`)
			}

			if (requestedEmbeds === null) {
				requestedEmbeds = []
			}

			requestedEmbeds.push(result)
		}
	})

	// no embeds were used
	if (requestedEmbeds === null) {
		return {
			codeRequestsEmbeds: false,
			requestedEmbeds: null
		}
	}

	// we know embeds were used but don't know
	// which ones (worst case)
	if (requestedEmbeds === false) {
		return {
			codeRequestsEmbeds: true,
			requestedEmbeds: "unknown",
			reasonWhyUnknown
		}
	}

	return {
		codeRequestsEmbeds: true,
		requestedEmbeds
	}
}
