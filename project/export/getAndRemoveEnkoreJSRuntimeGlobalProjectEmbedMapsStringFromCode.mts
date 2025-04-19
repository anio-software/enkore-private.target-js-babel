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
		CallExpression(path) {
			if (path.node.callee.type !== "MemberExpression") {
				return
			} else if (path.node.callee.object.type !== "Identifier") {
				return
			} else if (path.node.callee.property.type !== "Identifier") {
				return
			} else if (path.node.arguments.length !== 3) {
				return
			} else if (path.node.arguments[0].type !== "Identifier") {
				return
			} else if (path.node.arguments[0].name !== "globalThis") {
				return
			} else if (path.node.arguments[1].type !== "CallExpression") {
				return
			} else if (path.node.arguments[1].callee.type !== "MemberExpression") {
				return
			} else if (path.node.arguments[1].callee.object.type !== "Identifier") {
				return
			} else if (path.node.arguments[1].callee.property.type !== "Identifier") {
				return
			} else if (path.node.arguments[1].arguments.length !== 1) {
				return
			} else if (path.node.arguments[1].arguments[0].type !== "StringLiteral") {
				return
			}

			if (path.node.arguments[1].arguments[0].value !== symbolForIdentifier) {
				return
			}

			if (path.node.arguments[2].type !== "ObjectExpression") {
				return
			}

			for (const prop of path.node.arguments[2].properties) {
				if (prop.type !== "ObjectProperty") continue
				if (prop.key.type !== "Identifier") continue
				if (prop.key.name !== "value") continue
				if (prop.value.type !== "CallExpression") continue

				const callExpr = prop.value

				if (callExpr.callee.type !== "MemberExpression") continue
				if (callExpr.callee.object.type !== "Identifier") continue
				if (callExpr.callee.property.type !== "Identifier") continue

				if (callExpr.callee.object.name !== "JSON") continue
				if (callExpr.callee.property.name !== "parse") continue

				if (callExpr.arguments.length !== 1) continue
				if (callExpr.arguments[0].type !== "StringLiteral") continue

				globalProjectEmbedMaps.push(callExpr.arguments[0].value)
			}

			path.remove()
		}
	})

	return {
		code: generate(ast).code,
		globalProjectEmbedMaps
	}
}
