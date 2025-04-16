export type JsAssetURLProtocol = "text" | "js-bundle"

export type JsParseAssetURLResult = {
	protocol: JsAssetURLProtocol,
	path: string
}

export type JsParseAssetURL = (
	url : string
) => JsParseAssetURLResult

export type JsGetRequestedAssetsFromCodeReason =
	"unknown" |
	"starImportUsed" |
	"getAssetIdentifierUsed" |
	"getAssetDynamicURL"

export type JsGetRequestedAssetsFromCodeResult = {
	used: false,
	assets: null
} | {
	used: true,
	assets: JsParseAssetURLResult[]
} | {
	used: true,
	assets: "unknown",
	reason: JsGetRequestedAssetsFromCodeReason
}

export type JsGetRequestedAssetsFromCode = (
	code : string
) => Promise<JsGetRequestedAssetsFromCodeResult>
