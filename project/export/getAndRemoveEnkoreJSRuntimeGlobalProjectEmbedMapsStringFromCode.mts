import {parseSync} from "@babel/core"
import _traverse from "@babel/traverse"
import {generate} from "@babel/generator"

// see https://github.com/babel/babel/issues/13855
const traverse = _traverse.default

export function getAndRemoveEnkoreJSRuntimeGlobalProjectEmbedMapsStringFromCode(
	symbolForIdentifier: string,
	code: string
): {
	code: string
	globalProjectEmbedMaps: string[]
} {
	const globalProjectEmbedMaps: string[] = []

	const ast = parseSync(code, {
		sourceType: "module"
	})!

	traverse(ast, {
		AssignmentExpression(path) {
			if (path.node.left.type !== "MemberExpression") {
				return
			} else if (path.node.left.object.type !== "Identifier") {
				return
			} else if (path.node.left.object.name !== "globalThis") {
				return
			} else if (path.node.left.property.type !== "CallExpression") {
				return
			} else if (path.node.left.property.callee.type !== "MemberExpression") {
				return
			} else if (path.node.left.property.callee.object.type !== "Identifier") {
				return
			} else if (path.node.left.property.callee.property.type !== "Identifier") {
				return
			} else if (path.node.left.property.arguments.length !== 1) {
				return
			} else if (path.node.left.property.arguments[0].type !== "StringLiteral") {
				return
			}

			if (path.node.left.property.callee.object.name !== "Symbol") {
				return
			} else if (path.node.left.property.callee.property.name !== "for") {
				return
			}

			if (path.node.left.property.arguments[0].value !== symbolForIdentifier) {
				return
			}

			if (path.node.right.type !== "CallExpression") {
				return
			} else if (path.node.right.callee.type !== "MemberExpression") {
				return
			} else if (path.node.right.callee.object.type !== "Identifier") {
				return
			} else if (path.node.right.callee.property.type !== "Identifier") {
				return
			} else if (path.node.right.arguments.length !== 1) {
				return
			} else if (path.node.right.arguments[0].type !== "StringLiteral") {
				return
			}

			if (path.node.right.callee.object.name !== "JSON") {
				return
			} else if (path.node.right.callee.property.name !== "parse") {
				return
			}

			globalProjectEmbedMaps.push(path.node.right.arguments[0].value)

			path.remove()
		}
	})

	return {
		code: generate(ast).code,
		globalProjectEmbedMaps
	}
}
