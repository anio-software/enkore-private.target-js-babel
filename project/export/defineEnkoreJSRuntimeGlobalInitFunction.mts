import {
	symbolForIdentifier,
	initMethodName
} from "#~src/constants.mts"

export function defineEnkoreJSRuntimeGlobalInitFunction(
	fnRuntimeDataParamName: string,
	fnBody: string,
): string {
	const sym = `Symbol.for("${symbolForIdentifier}")`

	let code = ``

	code += `
globalThis.${initMethodName} = function ${initMethodName}() {
	const __runtimeGlobalDataArray = globalThis[${sym}]

	if (!Array.isArray(__runtimeGlobalDataArray)) {
		throw new Error(\`globalThis[${sym}] is not an array. This is a bug.\`)
	}

	//
	// loop over all global data entries
	// in a bundle, this will always be executed **once**
	// when running code with node, this will lead to some entries
	// to be initialized multiple times
	//
	for (const __data of __runtimeGlobalDataArray) {
		doRuntimeInit(__data)
	}

	function doRuntimeInit(${fnRuntimeDataParamName}) {
		${fnBody}
	}
};
`

	return code
}
