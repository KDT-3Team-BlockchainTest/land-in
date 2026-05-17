package model

type Visit struct {
	VisitID        string `json:"visitId"`
	UserIDHash     string `json:"userIdHash"`
	CampaignID     string `json:"campaignId"`
	TagIDHash      string `json:"tagIdHash"`
	VisitProofHash string `json:"visitProofHash"`
	LocationCode   string `json:"locationCode"`
	Status         string `json:"status"`
	VisitedAt      string `json:"visitedAt"`
	FabricTxID     string `json:"fabricTxId"`
}
