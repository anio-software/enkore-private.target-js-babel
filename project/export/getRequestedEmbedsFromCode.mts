import {getRequestedEmbedsFromCode as impl} from "#~src/getRequestedEmbedsFromCode/index.mts"

export async function getRequestedEmbedsFromCode(
	code: string
) {
	return await impl(code)
}
