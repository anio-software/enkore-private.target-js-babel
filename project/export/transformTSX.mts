import babel from "@babel/core"
// @ts-ignore:next-line
import presetTypeScript from "@babel/preset-typescript"
// @ts-ignore:next-line
import presetReact from "@babel/preset-react"

type Options = {
	filePath?: string
	rewriteImportExtensions?: boolean
}

export function transformTSX(
	code: string, {
		filePath = "index.tsx",
		rewriteImportExtensions = true
	}: Options = {}
): string {
	if (!filePath.endsWith(".tsx")) {
		throw new Error(
			`File path must end with ".tsx".`
		)
	}

	const options = {
		presets: [
			[presetTypeScript, {
				rewriteImportExtensions
			}],
			[presetReact, {
				runtime: "automatic"
			}]
		],
		filename: filePath
	}

	const result = babel.transformSync(code, options)

	return result!.code!
}
