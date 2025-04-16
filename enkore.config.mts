import {
	createConfig,
	createTargetJSNodeOptions
} from "enkore/spec/factory"

export default createConfig({
	target: {
		name: "js-node",
		options: createTargetJSNodeOptions({
			publishWithExactDependencyVersions: true,
			createTypesPackage: {
				orgName: "@enkore-types"
			},
			externalPackages: [
				"@babel/core",
				"@babel/preset-typescript"
			]
		})
	}
})
