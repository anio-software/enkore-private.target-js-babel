import {
	nodeCommonJSRequire,
	symbolForIdentifier,
	initMethodName,
	debugLogMethodName,
	symbolForInitializedGlobalRecords
} from "#~src/constants.ts"
import {logCodeRaw} from "@enkore/debug"

export function defineEnkoreJSRuntimeGlobalInitFunction(
	fnParamNames: [string, string],
	fnBody: string,
): string {
	const [fnRuntimeDataParamName, fnNodeCommonJSRequireParamName] = fnParamNames

	const sym = `Symbol.for("${symbolForIdentifier}")`

	let code = ``

	code += `
globalThis.${nodeCommonJSRequire} = await (async () => {
	try {
		const {default: nodeModule} = await import("node:module")

		const nodeJSRequire = nodeModule.createRequire("/")

		if (!nodeJSRequire || typeof nodeJSRequire !== "function") {
			return undefined
		}

		return function require(moduleName) {
			if (!moduleName.startsWith("node:")) {
				throw new Error(\`Module name must start with "node:".\`)
			}

			return nodeJSRequire(moduleName)
		}
	} catch {
		return undefined
	}
})();

globalThis.${debugLogMethodName} = function ${debugLogMethodName}(__msgToLog) {
	${logCodeRaw("__msgToLog")}
};

globalThis.${initMethodName} = function ${initMethodName}() {
	const runtimeGlobalDataRecords = globalThis[${sym}]

	if (!Array.isArray(runtimeGlobalDataRecords)) {
		throw new Error(\`globalThis[${sym}] is not an array. This is a bug.\`)
	}

	const initializedGlobalRecordsKey = Symbol.for("${symbolForInitializedGlobalRecords}")

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
			globalThis.${debugLogMethodName}(
				\`already initialized global record with id '\${globalDataRecordId}'.\`
			)

			continue
		}

		initializedGlobalRecords.set(globalDataRecordId, true)

		doRuntimeInit(
			record, globalThis.${nodeCommonJSRequire}
		)
	}

	function doRuntimeInit(${fnRuntimeDataParamName}, ${fnNodeCommonJSRequireParamName}) {
		${fnBody}
	}
};
`

	return code
}
