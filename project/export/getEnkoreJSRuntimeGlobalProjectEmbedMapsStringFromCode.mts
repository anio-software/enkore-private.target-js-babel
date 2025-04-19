import {parseSync, type ParseResult} from "@babel/core"
import _traverse from "@babel/traverse"
import {enkoreJSRuntimeGlobalProjectEmbedMapUUID} from "@enkore/spec/uuid"

// see https://github.com/babel/babel/issues/13855
const traverse = _traverse.default

export function getEnkoreJSRuntimeGlobalProjectEmbedMapsStringFromCode(
	code: string
): {
	ast: ParseResult
	globalProjectEmbedMaps: string[]
} {
	const embedMarkerUUID = enkoreJSRuntimeGlobalProjectEmbedMapUUID

	const globalProjectEmbedMaps: string[] = []

	const ast = parseSync(code, {
		sourceType: "module"
	})!

	traverse(ast, {
		StringLiteral(path) {
			const value = path.node.value

			if (value.startsWith(embedMarkerUUID)) {
				globalProjectEmbedMaps.push(value.slice(embedMarkerUUID.length))
			}
		}
	})

	return {
		ast,
		globalProjectEmbedMaps
	}
}
