const fourtune_assets_module = "@fourtune/realm-js/v0/assets"

export function pathResolvesToFourtuneGetAssetExport(
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
			if (moduleNode.source.value === fourtune_assets_module) {
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
			moduleNode.source.value === fourtune_assets_module
		) {
			return true
		}
	}

	return false
}
