import type {Node, MemberExpression, Identifier, StringLiteral} from "@babel/types"
import {parseSync} from "@babel/core"
import _traverse from "@babel/traverse"
import {generate} from "@babel/generator"
import {
	symbolForIdentifier,
	freezeObjectMethodName,
	freezeDataMethodName,
	initMethodName
} from "#~src/constants.mts"

// see https://github.com/babel/babel/issues/13855
const traverse = _traverse.default

function isIdentifier(
	node: Node,
	identifier: string
): node is Identifier {
	if (node.type !== "Identifier") {
		return false
	}

	return node.name === identifier
}

function isStringLiteral(
	node: Node,
	value: string
): node is StringLiteral {
	if (node.type !== "StringLiteral") {
		return false
	}

	return node.value === value
}

function isMemberExpression(
	node: Node,
	objectIdentifier: string,
	propertyIdentifier: string
): node is MemberExpression {
	if (node.type !== "MemberExpression") {
		return false
	} else if (node.object.type !== "Identifier") {
		return false
	} else if (node.property.type !== "Identifier") {
		return false
	} else if (node.object.name !== objectIdentifier) {
		return false
	}

	return node.property.name === propertyIdentifier
}

export function removeEnkoreJSRuntimeArtifactsFromCode(
	code: string
): {
	code: string
	globalData: unknown[]
} {
	const globalData: unknown[] = []

	const ast = parseSync(code, {
		sourceType: "module"
	})!

	traverse(ast, {
		AssignmentExpression(path) {
			if (isMemberExpression(path.node.left, "globalThis", freezeObjectMethodName)) {
				path.remove()
			} else if (isMemberExpression(path.node.left, "globalThis", initMethodName)) {
				path.remove()
			} else if (isMemberExpression(path.node.left, "globalThis", freezeDataMethodName)) {
				path.remove()
			}
		},

		ExpressionStatement(path) {
			if (path.node.expression.type !== "CallExpression") {
				return
			} else if (path.node.expression.callee.type !== "MemberExpression") {
				return
			} else if (!isIdentifier(path.node.expression.callee.property, "push")) {
				return
			} else if (path.node.expression.callee.object.type !== "MemberExpression") {
				return
			} else if (!isIdentifier(path.node.expression.callee.object.object, "globalThis")) {
				return
			} else if (path.node.expression.callee.object.property.type !== "CallExpression") {
				return
			} else if (!isMemberExpression(path.node.expression.callee.object.property.callee, "Symbol", "for")) {
				return
			} else if (path.node.expression.callee.object.property.arguments.length !== 1) {
				return
			} else if (!isStringLiteral(path.node.expression.callee.object.property.arguments[0], symbolForIdentifier)) {
				return
			} else if (path.node.expression.arguments.length !== 1) {
				return
			} else if (path.node.expression.arguments[0].type !== "CallExpression") {
				return
			} else if (!isMemberExpression(path.node.expression.arguments[0].callee, "globalThis", freezeDataMethodName)) {
				return
			} else if (path.node.expression.arguments[0].arguments.length !== 1) {
				return
			} else if (path.node.expression.arguments[0].arguments[0].type !== "CallExpression") {
				return
			} else if (!isMemberExpression(path.node.expression.arguments[0].arguments[0].callee, "JSON", "parse")) {
				return
			} else if (path.node.expression.arguments[0].arguments[0].arguments.length !== 1) {
				return
			} else if (path.node.expression.arguments[0].arguments[0].arguments[0].type !== "StringLiteral") {
				return
			}

			globalData.push(
				JSON.parse(path.node.expression.arguments[0].arguments[0].arguments[0].value)
			)

			path.remove()
		},

		IfStatement(path) {
			if (path.node.test.type !== "UnaryExpression") {
				return
			} else if (path.node.test.operator !== "!") {
				return
			} else if (path.node.test.argument.type !== "BinaryExpression") {
				return
			} else if (path.node.test.argument.left.type !== "CallExpression") {
				return
			} else if (!isMemberExpression(path.node.test.argument.left.callee, "Symbol", "for")) {
				return
			} else if (path.node.test.argument.left.arguments.length !== 1) {
				return
			} else if (!isStringLiteral(path.node.test.argument.left.arguments[0], symbolForIdentifier)) {
				return
			} else if (!isIdentifier(path.node.test.argument.right, "globalThis")) {
				return
			}

			path.remove()
		}
	})

	return {
		code: generate(ast).code,
		globalData
	}
}
