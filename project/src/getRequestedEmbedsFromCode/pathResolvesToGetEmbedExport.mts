const enkoreProjectModuleSpecifiers = [
	"@enkore-target/js-none/project",
	"@enkore-target/js-node/project",
	"@enkore-target/js-web/project"
]

function isEnkoreProjectModuleSpecifier(str: string): boolean {
	for (const specifier of enkoreProjectModuleSpecifiers) {
		if (str === specifier) {
			return true
		}
	}

	return false
}

export function pathResolvesToGetEmbedExport(
	path: any, bindingName: string
): boolean|"unknown" {
	const binding = path.scope.getBinding(bindingName)

	if (!binding) return false

	// we are only interested in module bindings
	if (binding.kind !== "module") return false

	// access the module node
	const moduleNode = binding.path.parentPath.node

	//
	// check if this is a call to getAsset()
	// from @fourtune/realm-js/assets
	//
	for (const specifier of moduleNode.specifiers) {
		// ignore default imports
		if (specifier.type === "ImportDefaultSpecifier") {
			continue
		}
		// handle star imports
		if (specifier.type === "ImportNamespaceSpecifier") {
			if (isEnkoreProjectModuleSpecifier(moduleNode.source.value)) {
				return "unknown"
			}

			continue
		}

		if (
			// local name is the name used in the scope
			// {getAsset as localName}
			//              ^^^ local name
			specifier.local.name !== bindingName
		) {
			continue
		}

		if (
			specifier.imported.name === "getAsset" &&
			isEnkoreProjectModuleSpecifier(moduleNode.source.value)
		) {
			return true
		}
	}

	return false
}
