export type ReasonWhyUnknown = "unknown"                |
                               "starImportUsed"         |
                               "getAssetIdentifierUsed" |
                               "getAssetDynamicURL"

export type RequestedEmbedsFromCodeResult = {
	codeRequestsEmbeds: false,
	requestedEmbeds: null
} | {
	codeRequestsEmbeds: true,
	requestedEmbeds: string[]
} | {
	codeRequestsEmbeds: true,
	requestedEmbeds: "unknown",
	reasonWhyUnknown: ReasonWhyUnknown
}
