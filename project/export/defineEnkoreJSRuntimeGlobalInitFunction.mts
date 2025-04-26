import {
	symbolForIdentifier,
	initMethodName
} from "#~src/constants.mts"
import {logCodeRaw} from "@enkore/debug"

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

	const initializedGlobalRecordsKey = Symbol.for("@enkore/js-runtime/initializedGlobalRecords")

	if (!(initializedGlobalRecordsKey in globalThis)) {
		Object.defineProperty(
			globalThis, initializedGlobalRecordsKey, {
				writeable: false,
				configurable: false,
				value: new Map()
			}
		)
	}

	const initializedGlobalRecords = globalThis[initializedGlobalRecordsKey]

	//
	// loop over all global data records
	// in a bundle, the number of records should be exactly **one**.
	//
	for (const record of runtimeGlobalDataRecords) {
		const {globalDataRecordId} = record.immutable

		if (initializedGlobalRecords.has(globalDataRecordId)) {
			${logCodeRaw("`already initialized global record with id '${globalDataRecordId}'.`")}

			continue
		}

		initializedGlobalRecords.set(globalDataRecordId, true)

		doRuntimeInit(record)
	}

	function doRuntimeInit(${fnRuntimeDataParamName}) {
		${fnBody}
	}
};
`

	return code
}
