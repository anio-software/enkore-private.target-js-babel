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
	assets: string[]
} | {
	used: true,
	assets: "unknown",
	reason: JsGetRequestedAssetsFromCodeReason
}

export type JsGetRequestedAssetsFromCode = (
	code : string
) => Promise<JsGetRequestedAssetsFromCodeResult>
