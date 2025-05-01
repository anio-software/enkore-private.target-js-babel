import {
	createConfig,
	createTargetJSNodeOptions
} from "enkore/spec/factory"

export const config: unknown = createConfig({
	target: {
		name: "js-node",
		options: createTargetJSNodeOptions({
			publish: {
				withExactDependencyVersions: true
			},
			externalPackages: [
				"@babel/core",
				"@babel/traverse",
				"@babel/generator",
				"@babel/preset-typescript"
			]
		})
	}
})
