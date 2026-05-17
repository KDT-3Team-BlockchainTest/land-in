package model

type NftMintRecord struct {
	MintRecordID  string `json:"mintRecordId"`
	VisitID       string `json:"visitId"`
	DraftID       string `json:"draftId"`
	UserIDHash    string `json:"userIdHash"`
	TokenID       string `json:"tokenId"`
	OwnerAddress  string `json:"ownerAddress"`
	ImageCID      string `json:"imageCid"`
	MetadataCID   string `json:"metadataCid"`
	PolygonTxHash string `json:"polygonTxHash"`
	MintStatus    string `json:"mintStatus"`
	MintedAt      string `json:"mintedAt"`
	FabricTxID    string `json:"fabricTxId"`
}
