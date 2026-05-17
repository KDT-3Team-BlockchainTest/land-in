package model

type RewardLedgerEntry struct {
	RewardTxID   string `json:"rewardTxId"`
	UserIDHash   string `json:"userIdHash"`
	VisitID      string `json:"visitId"`
	MintRecordID string `json:"mintRecordId"`
	CampaignID   string `json:"campaignId"`
	PointAmount  int    `json:"pointAmount"`
	RewardType   string `json:"rewardType"`
	Status       string `json:"status"`
	GrantedAt    string `json:"grantedAt"`
	FabricTxID   string `json:"fabricTxId"`
}
