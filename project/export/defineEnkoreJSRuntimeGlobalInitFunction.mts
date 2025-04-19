import {
	symbolForIdentifier,
	initMethodName
} from "#~src/constants.mts"

export function defineEnkoreJSRuntimeGlobalInitFunction(
	fnBody: string
): string {
	const sym = `Symbol.for("${symbolForIdentifier}")`

	let code = ``

	code += `
globalThis.${initMethodName} = function ${initMethodName}() {
	const __runtimeGlobalDataArray = globalThis[${sym}]

	if (!Array.isArray(__runtimeGlobalDataArray)) {
		throw new Error(\`globalThis[${sym}] is not an array. This is a bug.\`)
	} else if (__runtimeGlobalDataArray.length !== 1) {
		const n = __runtimeGlobalDataArray.length;

		throw new Error(
			\`globalThis[${sym}] must hold exactly one element (got \${n}). This is a bug.\`
		)
	}

	const globalRuntimeData = __runtimeGlobalDataArray[0]

	${fnBody}
};
`

	return code
}
