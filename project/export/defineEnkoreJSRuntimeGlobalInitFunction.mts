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
	const runtimeGlobalDataRecords = globalThis[${sym}]

	if (!Array.isArray(runtimeGlobalDataRecords)) {
		throw new Error(\`globalThis[${sym}] is not an array. This is a bug.\`)
	}

	//
	// loop over all global data records
	// in a bundle, the number of records should be exactly **one**.
	//
	for (const record of runtimeGlobalDataRecords) {
		doRuntimeInit(record)
	}

	function doRuntimeInit(${fnRuntimeDataParamName}) {
		${fnBody}
	}
};
`

	return code
}
