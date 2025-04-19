import babel from "@babel/core"
// @ts-ignore:next-line
import presetTypeScript from "@babel/preset-typescript"

type Options = {
	filePath?: string
	rewriteImportExtensions?: boolean
}

export function stripTypeScriptTypes(
	code: string, {
		filePath = "index.mts",
		rewriteImportExtensions = true
	}: Options = {}
): string {
	if (!filePath.endsWith(".mts")) {
		throw new Error(
			`File path must end with ".mts".`
		)
	}

	const options = {
		presets: [
			[presetTypeScript, {
				rewriteImportExtensions
			}]
		],
		filename: filePath
	}

	const result = babel.transformSync(code, options)

	return result!.code!
}
