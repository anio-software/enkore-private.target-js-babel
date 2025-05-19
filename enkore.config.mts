import {
	createConfig,
	createTargetJSNodeOptions
} from "@anio-software/enkore/spec/factory"

export const config: unknown = createConfig({
	target: {
		name: "js-node",
		options: createTargetJSNodeOptions({
			publishWithExactDependencyVersions: true,
			externalPackages: [
				"@babel/core",
				"@babel/traverse",
				"@babel/generator",
				"@babel/preset-typescript"
			],

			registry: {
				"anioSoftware": {
					url: "https://npm-registry.anio.software",
					authTokenFilePath: "secrets/anio_npm_auth_token",
					clientPrivateKeyFilePath: "secrets/npm_client.pkey",
					clientCertificateFilePath: "secrets/npm_client.cert"
				}
			},

			packageSourceRegistryByScope: {
				"@anio-software": {
					registry: "anioSoftware"
				}
			},

			publish: [{
				packageName: "@anio-software/enkore-private.target-js-babel",
				registry: "anioSoftware"
			}]
		})
	}
})
