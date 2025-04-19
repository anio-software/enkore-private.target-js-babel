import type {ParseResult} from "@babel/core"
import _traverse from "@babel/traverse"
import {enkoreJSRuntimeGlobalProjectEmbedMapUUID} from "@enkore/spec/uuid"
import {generate} from "@babel/generator"

// see https://github.com/babel/babel/issues/13855
const traverse = _traverse.default

export function updateEnkoreJSRuntimeGlobalProjectEmbedMapString(
	ast: ParseResult,
	newGlobalProjectEmbedMap: string
): string {
	const embedMarkerUUID = enkoreJSRuntimeGlobalProjectEmbedMapUUID

	traverse(ast, {
		StringLiteral(path) {
			const value = path.node.value

			if (value.startsWith(embedMarkerUUID)) {
				path.node.value = `${embedMarkerUUID}${newGlobalProjectEmbedMap}`

				// stop traversal
				path.stop()
			}
		}
	})

	return generate(ast).code
}
