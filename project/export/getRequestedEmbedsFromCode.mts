import {getRequestedEmbedsFromCode as impl} from "#~src/getRequestedEmbedsFromCode/index.mts"

export async function getRequestedEmbedsFromCode(
	enkoreProjectModuleSpecifiers: string[],
	enkoreProjectModuleGetEmbedProperties: string[],
	code: string
) {
	return await impl(
		enkoreProjectModuleSpecifiers,
		enkoreProjectModuleGetEmbedProperties,
		code
	)
}
