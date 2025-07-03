import type {NodePath} from "@babel/traverse"

type Ret = {
	methodUsed: string
} | false | "unknownUsage"

export function pathResolvesToGetEmbedExport(
	enkoreProjectModuleSpecifiers: string[],
	enkoreProjectModuleGetEmbedProperties: string[],
	path: NodePath,
	bindingName: string
): Ret {
	const binding = path.scope.getBinding(bindingName)

	if (!binding) return false

	// we are only interested in module bindings
	if (binding.kind !== "module") return false
	if (!binding.path.parentPath) return false

	// access the module node
	const importDeclaration = binding.path.parentPath.node

	//
	// check if this is a call to getEmbed()
	// from @enkore-target/js-XXX/project
	//
	if (importDeclaration.type !== "ImportDeclaration") {
		return false
	}

	for (const specifier of importDeclaration.specifiers) {
		// ignore default imports
		if (specifier.type === "ImportDefaultSpecifier") {
			continue
		}
		// handle star imports
		if (specifier.type === "ImportNamespaceSpecifier") {
			if (isEnkoreProjectModuleSpecifier(importDeclaration.source.value)) {
				return "unknownUsage"
			}

			continue
		}

		if (
			// local name is the name used in the scope
			// {getEmbed as localName}
			//              ^^^ local name
			specifier.local.name !== bindingName
		) {
			continue
		}

		if (specifier.imported.type !== "Identifier") continue

		if (
			enkoreProjectModuleGetEmbedProperties.includes(specifier.imported.name) &&
			isEnkoreProjectModuleSpecifier(importDeclaration.source.value)
		) {
			return {methodUsed: specifier.imported.name}
		}
	}

	return false

	function isEnkoreProjectModuleSpecifier(str: string): boolean {
		for (const specifier of enkoreProjectModuleSpecifiers) {
			if (str === specifier) {
				return true
			}
		}

		return false
	}
}
