import {getRequestedEmbedsFromCode as impl} from "#~src/getRequestedEmbedsFromCode/index.mts"

export async function getRequestedEmbedsFromCode(
	enkoreProjectModuleSpecifiers: string[],
	code: string
) {
	return await impl(enkoreProjectModuleSpecifiers, code)
}
