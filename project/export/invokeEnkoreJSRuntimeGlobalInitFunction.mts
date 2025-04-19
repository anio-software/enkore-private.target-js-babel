import {initMethodName} from "#~src/constants.mts"

export function invokeEnkoreJSRuntimeGlobalInitFunction(): string {
	return `\n;globalThis["${initMethodName}"]();\n`
}
