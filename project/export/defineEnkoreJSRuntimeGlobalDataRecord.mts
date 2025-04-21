import {
	symbolForIdentifier,
	freezeObjectMethodName,
	freezeGlobalDataRecordMethodName
} from "#~src/constants.mts"

import type {EnkoreJSRuntimeGlobalDataRecord} from "@enkore/spec"

//
// todo: give each global data a unique id
// this way we can ensure that this global data is only initialized once
//
export function defineEnkoreJSRuntimeGlobalDataRecord(
	record: EnkoreJSRuntimeGlobalDataRecord
): string {
	const sym = `Symbol.for("${symbolForIdentifier}")`

	let code = ``

	code += `
// from mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
;globalThis.${freezeObjectMethodName} = function(object) {
	// Retrieve the property names defined on object
	const propNames = Reflect.ownKeys(object);

	// Freeze properties before freezing self
	for (const name of propNames) {
		const value = object[name];

		if (typeof value === "function") {
			throw new Error("Unexpected function in freeze object function.")
		}

		if ((value && typeof value === "object")) {
			globalThis.${freezeObjectMethodName}(value);
		}
	}

	return Object.freeze(object);
};

;globalThis.${freezeGlobalDataRecordMethodName} = function(data) {
	const clonedData = globalThis.structuredClone(data);

	globalThis.${freezeObjectMethodName}(clonedData.immutable);

	return clonedData;
};
`

	code += `if (!(${sym} in globalThis)) {\n`
	code += `\tObject.defineProperty(globalThis, ${sym},`
	code += JSON.stringify({
		writable: false,
		configurable: false,
		value: []
	})
	code += `);\n`
	code += `}\n`

	code += `;globalThis[${sym}].push(`
	code += `globalThis.${freezeGlobalDataRecordMethodName}(`
	code += `JSON.parse(`
	code += JSON.stringify(JSON.stringify(record))
	code += `)));\n`

	return code
}
