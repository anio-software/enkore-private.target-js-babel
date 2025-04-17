export type ReasonWhyUnknown = "unknown"                |
                               "starImportUsed"         |
                               "getEmbedIdentifierUsed" |
                               "getEmbedDynamicURL"

export type RequestedEmbed = {
	embedPath: string
	requestedByMethod: string
}

export type RequestedEmbedsFromCodeResult = {
	codeRequestsEmbeds: false
	requestedEmbeds: null
} | {
	codeRequestsEmbeds: true
	requestedEmbeds: string[]
} | {
	codeRequestsEmbeds: true
	requestedEmbeds: "unknown"
	reasonWhyUnknown: ReasonWhyUnknown
}
