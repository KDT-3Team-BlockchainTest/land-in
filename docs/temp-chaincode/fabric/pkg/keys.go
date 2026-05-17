package pkg

func VisitKey(visitID string) string {
	return "visit:" + visitID
}

func MintKey(mintRecordID string) string {
	return "mint:" + mintRecordID
}

func RewardKey(rewardTxID string) string {
	return "reward:" + rewardTxID
}
