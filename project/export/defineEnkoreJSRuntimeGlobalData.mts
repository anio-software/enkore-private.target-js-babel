import {
	symbolForIdentifier,
	freezeObjectMethodName
} from "#~src/constants.mts"

//
// todo: give each global data a unique id
// this way we can ensure that this global data is only initialized once
//
export function defineEnkoreJSRuntimeGlobalData(
	data: Record<any, any>
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
	code += `globalThis.${freezeObjectMethodName}(`
	code += `JSON.parse(`
	code += JSON.stringify(JSON.stringify(data))
	code += `)));\n`

	return code
}
