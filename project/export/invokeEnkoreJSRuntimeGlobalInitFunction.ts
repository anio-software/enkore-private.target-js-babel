import {initMethodName} from "#~src/constants.ts"

export function invokeEnkoreJSRuntimeGlobalInitFunction(): string {
	return `\n;globalThis["${initMethodName}"]();\n`
}
